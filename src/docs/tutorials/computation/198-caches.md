# Lesson 198: Caches

- **What you will build** — a direct-mapped cache that costs `1` cycle on
  a hit and falls back to a `10`-cycle memory access on a miss, extended
  from caching single bytes to caching whole blocks at once, and a real,
  quantified comparison — `22` cycles against `40` — showing exactly what
  that block-based design buys for a genuinely ordinary access pattern.
  The transferable problem: every `read-byte` and `write-byte` call since
  Lesson 191 has been treated as free, instant, and identical in cost.
  Real memory isn't; it's dramatically slower than a real CPU, and a
  **cache** — a small, fast copy of *some* of memory, sitting between the
  two — is what makes that gap survivable, but only because real programs
  don't access memory randomly.
- **What you need to know first** — `read-byte`, `write-byte` (Lesson
  191); `[...]`, `get`, `assoc` (Section V); `mod`, `quot` (modular
  arithmetic); `nil?` (Lesson 136); the accumulator-recursion,
  compute-once-pass-to-helper patterns used throughout this section.
- **Terms introduced in this lesson**
  - **cache** — a small, fast region of storage holding copies of some of
    main memory's data, checked first, before ever paying memory's full
    cost.
  - **cache hit** — an access whose data is already in the cache; cheap.
  - **cache miss** — an access whose data isn't cached yet; the full,
    slow memory cost is paid, and the result is remembered for next time.
  - **temporal locality** — the real, common pattern of a program
    accessing the *same* address again soon after accessing it once.
  - **spatial locality** — the real, common pattern of a program
    accessing an address *near* one it just accessed, soon after.
  - **cache line (block)** — the unit a cache actually stores and
    fetches at once — several consecutive bytes together, not just the
    one that happened to be requested.
  - **direct-mapped** — a cache design where every address maps to
    exactly one possible cache line, computed directly from the address
    itself, with no choice or search involved.
  - **memory hierarchy** — the real, standard layering of storage by
    speed and size — registers, cache, main memory, and further still —
    each level larger and slower than the one above it.
- **Objects and methods used**: None new. This lesson reuses `[...]`,
  `get`, `assoc` (Section V), `mod`, `quot` (modular arithmetic), `nil?`
  (Lesson 136), `if`, `=`, `-`, `+`, `empty?`, `first`, `rest` (already
  covered).

---

## Concept Unit: Hits, Misses, and Why It Matters at All

### The Problem

Every memory access in this section, since Lesson 191, has cost nothing
extra to simulate — one `get` is the same as any other. Real memory
access has a real, measurable cost, and it's large: reading from actual
RAM takes a CPU roughly a hundred times longer than reading from a
register. Something has to sit between them, or every single memory
access would be that slow.

### Introduce the Concept in Isolation

Skipped — a cache line is a plain `[address value]` pair, and checking it
is one `get` plus one comparison, both already fully covered. The real
demonstration is the concrete cost difference, shown directly below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from this section's memory and CPU work.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

A **direct-mapped** cache: every address maps to exactly one line, by
`mod`, with no ambiguity about where to look.

```clojure
(defn cache-line-index
  [address num-lines]
  (mod address num-lines))
```

```clojure
(defn access-hit?
  [line address]
  (if (nil? line) false (= (get line 0) address)))
```

### The Updated Project

`access` checks the cache first; on a hit it costs `1`, on a miss it pays
memory's full `10`-cycle cost and remembers the result for next time:

```clojure
(defn access
  [cache memory address num-lines]
  (access-check cache (get cache (cache-line-index address num-lines)) memory address num-lines))
```

```clojure
(defn access-check
  [cache line memory address num-lines]
  (if (access-hit? line address)
    [(get line 1) cache 1]
    (access-miss cache memory address num-lines)))
```

```clojure
(defn access-miss
  [cache memory address num-lines]
  [(read-byte memory address)
   (assoc cache (cache-line-index address num-lines) [address (read-byte memory address)])
   10])
```

### Mechanical Walkthrough

Enumerating `cache-line-index`'s body: `(mod address num-lines)` — **(a)
first appearance**: this specific rule — an address's own remainder,
divided by however many lines the cache has — is what makes this cache
**direct-mapped**: every address has exactly one possible home, decided
by arithmetic alone, nothing to search.

Enumerating `access-hit?`'s body: `(nil? line)`, `(= (get line 0)
address)` — **(c) already basic** individually; together, a line only
counts as a hit if something is cached there *and* it's cached for
*this exact* address.

Enumerating `access`'s and `access-check`'s bodies: `get cache
(cache-line-index ...)` — **(c) already basic**; the whole line, fetched
in one step, is passed to `access-check` rather than re-derived — the
established compute-once-pass-to-helper discipline. The returned triple,
`[value cache cost]` — **(a) first appearance**: this lesson's own
addition to every earlier vector-as-pair result this section has
returned — a third slot, tracking cost itself as a real, running value.

Trace `access` on the same address twice in a row, `(make-memory 4)`
holding `[10 20 30 40]`, an empty two-line cache `[nil nil]`:

```
access [nil nil] memory 0 2
  line = get [nil nil] 0 → nil
  access-hit? nil 0 → false (MISS)
  → [10, [[0 10] nil], 10]

access [[0 10] nil] memory 0 2
  line = get [[0 10] nil] 0 → [0 10]
  access-hit? [0 10] 0 → true (HIT)
  → [10, [[0 10] nil] (unchanged), 1]
```

The second access to the *identical* address costs `1` cycle instead of
`10` — a real, tenfold difference, earned by nothing more than asking for
the same thing twice. This is exactly what a cache is for.

### CS Lens

A small, fast store checked before a slow, authoritative one, with real
hit and miss vocabulary, recurs at wildly different scales.

```
Also recognized in: every real CPU's own L1/L2/L3 cache hierarchy,
built on precisely this hit/miss idea; web and CDN caching, which uses
the identical "hit" and "miss" terms for a URL already versus not yet
copied close to a requester; and database query result caching, storing
an expensive query's answer so an identical later query doesn't pay to
recompute it
```

### SE Lens

The alternative — no cache at all, every access paying memory's full
cost, every time — is genuinely simpler: no extra circuitry, and no new
correctness question about whether cached data still matches what's
really in memory (a question this lesson's own closing section takes
seriously). A cache trades that simplicity for real speed, but only
when access patterns actually reuse data — if nothing were ever
accessed twice, a cache would be pure overhead, paying for lookups that
never hit anything. Whether that trade is worth it depends entirely on
whether real programs actually behave that way, which the next unit
answers directly.

---

## Concept Unit: Locality

### The Problem

The first unit's win depended on accessing the *exact same* address
twice. Real programs do that constantly — but they also do something the
first unit's cache can't exploit at all: access addresses *near* ones
they've just touched, without ever repeating the same one. Does that
kind of pattern benefit from caching too?

### Introduce the Concept in Isolation

Skipped — reusing a whole block per line is arithmetic and comparisons
already covered; the real content is what block-based caching actually
buys, shown directly in the trace below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `access-miss`.
- **Dependencies**: Babashka, already installed.

### The New Code

A **cache line** now holds a whole block of bytes, tagged by where that
block starts — its `block-base`, the address rounded down to the nearest
multiple of `block-size`:

```clojure
(defn block-base
  [address block-size]
  (- address (mod address block-size)))
```

```clojure
(defn read-block
  [memory base block-size]
  [(read-byte memory base) (read-byte memory (+ base 1))])
```

### The Updated Project

A hit now means "this address's *block* is already cached," not just
"this exact address is":

```clojure
(defn access2-hit?
  [line address block-size]
  (if (nil? line) false (= (get line 0) (block-base address block-size))))
```

```clojure
(defn access2
  [cache memory address num-lines block-size]
  (access2-check cache (get cache (cache-line-index address num-lines)) memory address num-lines block-size))
```

```clojure
(defn access2-check
  [cache line memory address num-lines block-size]
  (if (access2-hit? line address block-size)
    [(get (get line 1) (mod address block-size)) cache 1]
    (access2-miss cache memory address num-lines block-size)))
```

```clojure
(defn access2-miss
  [cache memory address num-lines block-size]
  (access2-miss-result (block-base address block-size)
                        (read-block memory (block-base address block-size) block-size)
                        cache address num-lines block-size))
```

```clojure
(defn access2-miss-result
  [base block cache address num-lines block-size]
  [(get block (mod address block-size))
   (assoc cache (cache-line-index address num-lines) [base block])
   10])
```

### Mechanical Walkthrough

Enumerating `block-base`'s body: `(- address (mod address block-size))`
— **(a) first appearance**: rounds any address *down* to the start of
whichever fixed-size block it belongs to — address `1`, with
`block-size 2`, rounds down to `0`; address `3` rounds down to `2`.

Enumerating `access2-hit?`'s body: comparing `block-base`, not the raw
address — **(a) first appearance**: two *different* addresses can now
both count as a hit against the same cached line, provided they land in
the same block.

Enumerating `access2-check`'s hit branch: `(get (get line 1) (mod address
block-size))` — **(a) first appearance**: reaching *into* the cached
block for the specific byte requested, using the address's own position
*within* the block, not the block's own tag.

Trace accessing address `0`, then address `1` — a *different* address,
never individually accessed before — with `block-size 2`, `num-lines 2`,
against `memory = [10 20 30 40]`:

```
access2 [nil nil] memory 0 2 2
  block-base 0 2 → 0
  MISS: read-block memory 0 2 → [10 20]
  → [10, [[0 [10 20]] nil], 10]

access2 [[0 [10 20]] nil] memory 1 2 2
  block-base 1 2 → 0        (1 rounds down to the same block as 0)
  line's own base = 0 → HIT
  value = get [10 20] (mod 1 2 = 1) → 20
  → [20, cache (unchanged), 1]
```

Address `1` was never accessed before this moment — and it's still a hit,
costing `1` cycle instead of `10`, entirely because it happened to share
a block with address `0`, which *was* accessed a moment earlier. This is
**spatial locality**'s real payoff: a cache built around whole blocks
benefits from nearby accesses the first unit's single-byte design
couldn't have exploited at all.

### CS Lens

Both kinds of locality are real, empirically well-documented patterns
in real programs, not assumptions invented to make caching look good.

```
Also recognized in: the well-documented, real observation that typical
programs spend the overwhelming majority of their time repeatedly
touching a small fraction of their total memory (temporal locality) and
touching addresses near each other in short succession (spatial
locality); array- and loop-heavy code — this curriculum's own countless
array-processing functions since Section V — as the textbook case that
benefits enormously from spatial locality; and linked-list traversal
(Lesson 85), which does *not* benefit nearly as much, since nothing
guarantees one node lives anywhere near the next one in memory
```

### SE Lens

Sticking with the first unit's single-byte-per-line design was the
available alternative, and it wastes nothing on bytes that might never
be used. It also gets *zero* benefit from spatial locality — accessing
address `1` right after address `0` would still miss, paying the full
`10`-cycle cost twice, with no way to know they were ever related.
Block-based caching, built here, bets that nearby data will likely be
needed soon too — winning big exactly when that bet is right, as this
unit's own trace shows, and wasting a little cache space on unused
bytes when it's wrong. Real hardware makes this bet universally, because
real access patterns overwhelmingly justify it.

---

## Concept Unit: The Memory Hierarchy, Quantified

### The Problem

Both units so far have shown isolated hits and misses. A real program
makes many accesses in a row — does the combination of temporal and
spatial locality actually add up to a meaningful difference over a
realistic sequence, not just one cherry-picked pair of accesses?

### Introduce the Concept in Isolation

Skipped — running a sequence of accesses is ordinary accumulator
recursion over a list, already fully covered; the real payoff is the
quantified total, shown directly below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `access2-miss-result`.
- **Dependencies**: Babashka, already installed.

### The New Code

Running a whole sequence of accesses, threading the cache and a running
total cost through every step:

```clojure
(defn run-accesses
  [cache memory addresses num-lines block-size total-cost]
  (if (empty? addresses)
    total-cost
    (run-accesses-step cache memory addresses num-lines block-size total-cost
                        (access2 cache memory (first addresses) num-lines block-size))))
```

### The Updated Project

```clojure
(defn run-accesses-step
  [cache memory addresses num-lines block-size total-cost result]
  (run-accesses (get result 1) memory (rest addresses) num-lines block-size (+ total-cost (get result 2))))
```

### Mechanical Walkthrough

`run-accesses`'s and `run-accesses-step`'s bodies — **(b) a hard concept
reappearing** throughout: accumulator recursion and compute-once-
pass-to-helper, both used constantly since Section III, now threading
`cache` and `total-cost` together across an entire access sequence.

Trace `run-accesses` walking addresses `0`, `1`, `2`, `3` in order —
exactly the pattern a loop summing a four-byte array would produce —
against `memory = [10 20 30 40]`, `block-size 2`, `num-lines 2`, an
empty cache:

```
access 0: MISS (new block [10 20] cached at line 0) → cost 10, total 10
access 1: HIT  (same block as 0)                     → cost 1,  total 11
access 2: MISS (new block [30 40] cached at line 1) → cost 10, total 21
access 3: HIT  (same block as 2)                     → cost 1,  total 22
```

`run-accesses` returns `22`. Compare that to what the *same* four
accesses would cost with no cache at all — every single one paying the
full `10`-cycle memory cost: `4 × 10 = 40`. Twenty-two cycles against
forty — this is the real, quantified reason a **memory hierarchy**
exists at all: not a theoretical promise, but a concrete, nearly-halved
cost, earned entirely from an access pattern (sequential array access)
this curriculum has already written dozens of times without ever paying
attention to what it cost.

### CS Lens

Layering storage by speed and size, each level larger and slower than
the one above it, is the real, standard architecture of every computer
sold today.

```
Also recognized in: the named "memory hierarchy" itself, taught in
every computer architecture course — registers (Lesson 195, a handful of
slots, effectively free to access) at the top, cache (this lesson) below
that, main memory (Lesson 191, large and comparatively slow) below that,
and disk or network storage further still, each level dramatically
larger and slower than the one above it
```

### SE Lens

Building one single, uniformly fast memory instead of a small cache plus
a large, slow main memory was the available alternative. Its real,
documented cost: the fast memory technology real caches use (SRAM) is
dramatically more expensive per byte than the technology real RAM uses
(DRAM) — building an entire address space's worth of SRAM is real,
prohibitively expensive at any meaningful capacity. The memory
hierarchy, demonstrated concretely in this unit, captures most of the
speed benefit for a small fraction of the cost, precisely *because*
real access patterns exhibit the locality the second unit demonstrated
— a real, foundational economic tradeoff behind every computer actually
built, not just an engineering convenience.

---

## Connect the Pieces

Follow one four-address access sequence — `0`, `1`, `2`, `3`, the shape
of an ordinary array-summing loop — through every idea this lesson built.
The first unit's direct-mapped indexing decides, by arithmetic alone,
which of two lines each address could ever occupy. The second unit's
block-based caching means addresses `0` and `1` share one cached block,
and addresses `2` and `3` share another — so only two of the four
accesses ever pay memory's real cost. `run-accesses`, the third unit,
totals it up: `22` cycles, against `40` for the identical sequence with
no cache at all. Nothing about this result required an unusual or
contrived access pattern — it's exactly what sequential array access,
already written throughout this entire curriculum, naturally produces,
which is the actual point: caching isn't a special-case optimization for
unusual programs, it's a near-universal win for perfectly ordinary ones.

## What Breaks Without This

Nothing built in this lesson knows anything about `write-byte` (Lesson
191) or `store-mem` (Lesson 196) — both write straight to memory with no
awareness that a cache might be holding a now-outdated copy of the same
address. Cache address `0`, then modify memory directly, bypassing the
cache entirely:

```clojure
(access [[0 10] nil] memory 0 2)
```

```clojure
(def memory-changed (write-byte memory 0 99))
```

```clojure
(access [[0 10] nil] memory-changed 0 2)
```

Trace the final call: `cache-line-index 0 2` is `0`; `get cache 0` is
`[0 10]`; `access-hit? [0 10] 0` is `true`, since the cached tag still
matches address `0` — nothing about the cache changed when memory did.
The result: `[10, ...]` — the cache reports `10`, the *old* value, even
though `memory-changed` genuinely holds `99` at address `0` now. This is
a real, well-documented, serious class of bug called **cache
incoherence**: a cache is only correct as long as nothing else is
allowed to change the data it's holding a copy of without telling it.
Nothing here throws an error — the access succeeds, returns a
perfectly valid-looking number, and that number is simply wrong. Real
hardware solves this with real, dedicated cache-coherence protocols; this
lesson's own simple cache has none, which is an honest limitation, not
an oversight to be embarrassed about — every cache built in this lesson
assumed, silently, that memory is never changed by anything except
`access` itself.

## Exercises

1. Trace `access2` on address `2`, then address `3`, against `memory =
   [10 20 30 40]` with a fresh empty two-line cache, `block-size 2`, and
   confirm the second access is a hit, matching this lesson's own
   `access 2`/`access 3` result inside `run-accesses`.
2. Using `run-accesses`, trace the cost of accessing addresses `0`, `2`,
   `0`, `2` in that order (not sequential — alternating between two
   distant addresses) with the same two-line, block-size-`2` cache, and
   compare the total to this lesson's own `22`-cycle sequential result.
   State whether alternating access patterns benefit from this cache as
   much as sequential ones do, and why.
3. Sketch, in prose, what would need to change about `access2-miss` for a
   cache with *more than two* lines to still correctly decide which line
   a given address's block belongs to. No code required yet.

## Definition of Done

- [ ] `cache-line-index`, `access-hit?`, `access`, `access-check`, and
      `access-miss` are written and hand-traced for the same-address hit
      example, matching this lesson's `10`-then-`1`-cycle result.
- [ ] `block-base`, `read-block`, `access2-hit?`, `access2`,
      `access2-check`, `access2-miss`, and `access2-miss-result` are
      written and hand-traced for the address-`0`-then-`1` example,
      matching the spatial-locality hit.
- [ ] `run-accesses` and `run-accesses-step` are written and hand-traced
      for the four-address sequential access pattern, matching the
      `22`-cycle total.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why the final `access` call returns `10`
      instead of the genuinely current value, `99`.
- [ ] Commit with a message explaining *why* a cache built around whole
      blocks benefits from addresses that were never individually
      accessed before, not just *what* functions were added.
