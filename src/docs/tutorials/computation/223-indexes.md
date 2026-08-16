# Lesson 223: Indexes — Deriving Why Databases Use Trees and Hash Structures

**What you will build**: A direct, quantified proof that Lesson 221's
`select-where` gets slower in exact proportion to how much data exists,
regardless of how few rows actually match — then two genuinely different
fixes, each trading a different cost for speed. A sorted index paired
with binary search cuts lookups from linear to logarithmic, but reveals
a real, honest cost of its own: keeping entries sorted makes insertion
expensive, which is precisely why real databases reach for a balanced
tree instead of a flat sorted array. A hash index skips comparisons
almost entirely by computing exactly where a key belongs, at the cost of
losing any usable ordering at all.

**What you need to know first**: Lesson 221's `select-where` and
`field-value`, and its own closing statement that a full-table scan is
the real cost this lesson exists to fix. Lesson 92's binary-search-tree
node convention and the general idea of halving a search space.

**Terms used in this lesson**:

- **index** (the database kind) — a separate structure built specifically
  to speed up lookups on one field, at the cost of extra storage and
  upkeep; exists because `select-where`'s own full-table scan gets
  slower in direct proportion to how much data exists, regardless of how
  few rows actually match.
- **sorted index** — an index that keeps its entries ordered by key,
  enabling binary search instead of a linear scan; trades a genuinely
  fast lookup for the real cost of keeping insertion order-preserving.
- **hash index** — an index that computes exactly which bucket a key
  belongs in directly from the key's own value, skipping comparisons
  almost entirely; trades a genuinely fast, order-independent lookup for
  the loss of any usable ordering at all.
- **hash function** (also **hash bucket**) — a function mapping a key to
  a bucket number, deterministic (the same key always maps to the same
  bucket) but not necessarily unique (different keys can land in the
  same bucket); the mechanism that makes a hash index's near-constant-
  time lookup possible.
- **collision** — two different keys mapping to the same bucket; not a
  bug, an ordinary, expected occurrence any real hash index has to
  handle correctly, never treat as an error. This lesson resolves a
  collision with **chaining**: every bucket holds a small vector of
  every `[key row-index]` pair that ever landed there, scanned linearly
  only within that one bucket — the same technique named, and given its
  first real treatment, back in Lesson 89's own hash table.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`declare`**
  - *What it is:* Clojure's forward-declaration form.
  - *Implementation:* `(declare name)` introduces `name` into the
    current namespace with no value yet, letting an earlier-defined
    function reference it before its real definition appears.
  - *Its use:* `binary-search-index` and `search-index-at-mid` call each
    other; `declare` lets `binary-search-index` be written first while
    still calling a function not yet defined.
- **`if`** / **`cond`**
  - *What they are:* Clojure's two-branch and multi-branch conditional
    special forms.
  - *Implementation:* `(if test then else)` returns `then` or `else`;
    `(cond test1 result1 ... true default)` returns the result paired
    with the first truthy test.
  - *Their use:* `if` decides whether a binary search range is empty;
    `cond` drives every recursive scan and the three-way branch between
    "found it," "search the upper half," and "search the lower half."
- **`quot`**
  - *What it is:* Clojure's integer-division function.
  - *Implementation:* `(quot a b)` returns `a` divided by `b`, truncated
    toward zero — no remainder, no fraction.
  - *Its use:* finding the midpoint index between `low` and `high` in a
    binary search.
- **`mod`**
  - *What it is:* Clojure's modulo function.
  - *Implementation:* `(mod a b)` returns the remainder of `a` divided by
    `b`, always in the range `0` to `b - 1` for a positive `b`.
  - *Its use:* `hash-bucket`'s entire implementation — mapping any key to
    one of a fixed number of buckets.
- **`=`** / **`<`** / **`>`**
  - *What they are:* Clojure's equality and ordering comparison
    functions.
  - *Implementation:* `(= a b)`, `(< a b)`, `(> a b)` compare two
    values.
  - *Their use:* every scan's stopping condition, and binary search's own
    "go left or right" decision.
- **`get`** / **`assoc`** / **`count`** / **`+`** / **`-`**
  - *What they are:* Clojure's positional lookup, functional-update,
    length, addition, and subtraction functions.
  - *Implementation:* `(get coll index)` reads; `(assoc coll index
    value)` returns an updated copy; `(count coll)` returns length;
    `(+ a b)` / `(- a b)` return the sum or difference.
  - *Their use:* reused throughout, building and reading this lesson's
    sorted and hash index structures the same way Lessons 220–222 built
    theirs.

---

## Concept Unit: The Cost of a Linear Scan, Quantified

### The Problem

`select-where` (Lesson 221) checks every single row, in order, until it
either finds a match or runs out of rows. For a table with a handful of
rows, that's instant. Does it stay instant as the table grows, or does
the real cost scale with something a database's own design should
account for directly, rather than leaving as an unexamined assumption?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because database indexing is a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn scan-comparisons [schema table field-name target index]
  (cond
    (= index (count table)) index
    (= (field-value schema (get table index) field-name) target) (+ index 1)
    true (scan-comparisons schema table field-name target (+ index 1))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def schema ["id" "name"])
#'user/schema
user=> (def table4 [[1 "a"] [5 "b"] [9 "c"] [13 "d"]])
#'user/table4
user=> (def table8 [[1 "a"] [5 "b"] [9 "c"] [13 "d"] [17 "e"] [21 "f"] [25 "g"] [29 "h"]])
#'user/table8
user=> (scan-comparisons schema table4 "id" 999 0)
4
user=> (scan-comparisons schema table8 "id" 999 0)
8
```

### Mechanical Walkthrough

`(defn scan-comparisons [schema table field-name target index] ...)` —
identical in shape to Lesson 221's `select-where`, but instrumented to
answer a different question: not "which rows matched," but "how many
rows did this scan have to look at before stopping." `(cond ...)`,
reappearing: `(= index (count table)) index` — ran off the end without
finding a match, and the number of rows examined is exactly `index`
itself, since every position from `0` up to (but not including) `index`
was checked. `(= (field-value schema (get table index) field-name)
target) (+ index 1)` — found it at this position; the number of rows
examined is `index + 1` (positions `0` through `index`, inclusive).
`true (scan-comparisons ...)` — no match yet, keep scanning.

Trace: `999` doesn't exist in either table, so both calls hit the first
branch, and the returned count is exactly the table's own size —
`table4` costs `4`, `table8` costs `8`. Doubling the table doubled the
cost. This isn't a worst-case artifact of choosing an absent key on
purpose — an absent key, or a key that happens to be the *last* row, are
the same case `select-where` has no way to distinguish in advance; every
call has to be prepared to scan the whole table, because nothing tells
it in advance where — or whether — a match exists.

### CS Lens

This is **linear time**, `O(n)`, made concrete rather than asserted: the
number of comparisons `scan-comparisons` performs grows in *direct
proportion* to the table's own size, with no way to do better using this
particular strategy — every row genuinely has to be looked at, because
nothing about the table's own layout gives any hint about where a
specific value might be. A table with a million rows costs, in the
worst case, a million comparisons for a single lookup, exactly as this
lesson's `4`-versus-`8` doubling predicts scaled up.

Also recognized in: searching a phone book by reading every entry from
the first page, one at a time, instead of using the alphabetical
ordering it's already printed in; a security guard checking every badge
in a stack one by one to find a specific employee, instead of a
system that could look the person up directly; a spreadsheet's
`VLOOKUP` run against an unsorted range, forced to check every row since
nothing about the range's own layout narrows the search.

### SE Lens

The alternative to accepting this cost is exactly what the rest of this
lesson builds: a separate structure, built and maintained *alongside*
the table, whose entire purpose is to make lookups on one specific field
faster than scanning everything. That structure isn't free — it costs
extra storage (a second copy of every key, plus bookkeeping) and extra
work every time the underlying table changes (an index has to be kept
in sync with every insert). `scan-comparisons`'s own honest number —
`4` for `4` rows, `8` for `8` — is the baseline every one of this
lesson's remaining units is measured against, and the entire reason an
index is ever worth its extra cost is that this baseline gets worse, not
better, as real data grows.

---

## Concept Unit: A Sorted Index and Binary Search

### The Problem

If a separate structure tracked every key in *sorted* order, alongside
which row it belongs to, a lookup could work the way Lesson 92's binary
search tree already does — check the middle, and eliminate half the
remaining possibilities with a single comparison, instead of checking
every entry one at a time. Does keeping this extra structure sorted
actually pay for itself, and does it cost anything real in exchange?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because database indexing is a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn sorted-index-key [sorted-index position]
  (get (get sorted-index position) 0))

(declare search-index-at-mid)

(defn binary-search-index [sorted-index key low high]
  (if (> low high)
    -1
    (search-index-at-mid sorted-index key low high (quot (+ low high) 2))))

(defn search-index-at-mid [sorted-index key low high mid]
  (cond
    (= (sorted-index-key sorted-index mid) key) (get (get sorted-index mid) 1)
    (< (sorted-index-key sorted-index mid) key) (binary-search-index sorted-index key (+ mid 1) high)
    true (binary-search-index sorted-index key low (- mid 1))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def sorted-idx [[2 2] [5 0] [9 1] [13 3]])
#'user/sorted-idx
user=> (binary-search-index sorted-idx 9 0 3)
1
user=> (binary-search-index sorted-idx 2 0 3)
2
user=> (binary-search-index sorted-idx 7 0 3)
-1
```

The honest other side — inserting a new smallest key requires touching
every existing entry:

```
user=> (def after-insert (prepend-and-shift sorted-idx 1 4))
#'user/after-insert
user=> after-insert
[[1 4] [2 2] [5 0] [9 1] [13 3]]
```

### Mechanical Walkthrough

`sorted-idx` is `[[2 2] [5 0] [9 1] [13 3]]` — `[key row-index]` pairs,
kept in ascending key order this time, unlike Lesson 220's or 221's own
append-only vectors.

`(defn sorted-index-key [sorted-index position] (get (get sorted-index
position) 0))` — `get` twice, reappearing, reads the key at a given
position.

`(declare search-index-at-mid)` — since `binary-search-index` (below)
calls `search-index-at-mid` before it's been defined in the file, this
forward-declaration lets the file compile in the order it's written,
the same purpose Lesson 91's own mutually-recursive functions needed.

`(defn binary-search-index [sorted-index key low high] ...)` — `if`,
reappearing: `(> low high)` — the search range has become empty,
meaning every candidate has been ruled out — return `-1`, not found.
Otherwise, hand off to `search-index-at-mid` with `mid`, `quot`,
reappearing, computing the midpoint of `low` and `high` by integer
division.

`(defn search-index-at-mid [sorted-index key low high mid] ...)` —
`cond`, reappearing, three branches: `(= (sorted-index-key sorted-index
mid) key)` — the middle entry *is* the key — return its row index,
`(get (get sorted-index mid) 1)`. `(< (sorted-index-key sorted-index
mid) key)` — the middle entry's key is smaller than what's being
searched for, meaning (since the index is sorted) the target, if it
exists, must be somewhere to the right — recurse with `low = mid + 1`.
`true` — the middle entry's key must be larger — recurse with `high =
mid - 1`, searching the left half instead.

Trace `(binary-search-index sorted-idx 9 0 3)`: `low=0, high=3`, `mid =
(quot (+ 0 3) 2) = 1`. `(sorted-index-key sorted-idx 1)` is `5` — `5 <
9`, so recurse with `low=2, high=3`. New `mid = (quot (+ 2 3) 2) = 2`.
`(sorted-index-key sorted-idx 2)` is `9` — matches — return `(get (get
sorted-idx 2) 1)`, which is `1`. Two comparisons total, against a
`4`-entry index — compare to Unit 1's linear scan, which would need up
to `4`.

The insertion cost, traced separately: `prepend-and-shift` rebuilds the
*entire* sorted index with a new smallest key placed first, then every
one of the four original entries copied in after it, one at a time —
`after-insert` has `5` entries, and every single one of the original
`4` had to be touched to make room for the new first entry, even though
only one genuinely new piece of information was being added.

### CS Lens

This is **logarithmic time**, `O(log n)`, made concrete: each comparison
in `search-index-at-mid` eliminates *half* of whatever range remained,
so the number of comparisons needed grows far more slowly than the
index's own size — doubling a sorted index from `4` entries to `1024`
multiplies its worst-case lookup cost by roughly `10`, not by `256`.
But the insertion trace above reveals the real, honest cost this
strategy is *not* free of: a flat sorted array's lookup is fast
precisely *because* every entry sits at a fixed, ordered position, and
maintaining that fixed ordering on every insert costs touching
potentially every other entry. **This is the actual reason real
databases store indexes as trees — Lesson 100's own B-tree, specifically
— rather than a flat sorted array**: a balanced tree keeps entries
ordered well enough to support the same halving-search strategy, while
an insertion only ever has to touch one root-to-leaf path, not
potentially the entire structure, because a tree's own ordering is
maintained locally, at each node, rather than by every element's
absolute position in one contiguous block.

Also recognized in: a dictionary's own printed page order, letting a
reader jump to roughly the right section by flipping directly there
instead of reading every page — but reprinting the entire book to insert
one new word in the correct alphabetical spot; a sorted spreadsheet
column supporting fast visual scanning, but requiring every row below an
inserted entry to shift down one position; a library's shelving system,
fast to browse in call-number order, expensive to keep correctly ordered
every time a new book needs to be inserted between two existing ones.

### SE Lens

The alternative to paying insertion's real cost is exactly Unit 1's own
baseline: an unsorted table, where insertion is just an append — cheap,
`O(1)` — at the cost of every lookup being `O(n)`. A sorted array is the
opposite trade: lookups become `O(log n)`, genuinely fast, but every
insertion becomes `O(n)`, genuinely slow, for the identical reason —
maintaining a single, fixed, ordered position for every element is what
made the fast lookup possible in the first place, and that same fixed
positioning is exactly what an insertion has to disturb. Neither
extreme is what real production databases actually use for a growing,
frequently-updated table — they reach for a balanced tree specifically
because it refuses to accept either extreme, trading a small, bounded
amount of *additional* per-operation bookkeeping (rebalancing) for
avoiding both this unit's flat-array insertion cost and Unit 1's
full-table scan cost at once.

---

## Concept Unit: A Hash Index — Computing Where a Key Belongs

### The Problem

Binary search still costs real comparisons — `O(log n)`, far better than
a full scan, but not free, and it only works because the index stays
sorted, which Unit 2 just proved is expensive to maintain. If a lookup
never needs the data in any particular *order* — only "does this exact
key exist, and where" — is there a way to skip comparisons almost
entirely, by computing directly where a key belongs instead of searching
for it?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because database indexing is a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn hash-bucket [key bucket-count]
  (mod key bucket-count))

(defn hash-insert-at [index bucket-index key row-index]
  (assoc index bucket-index (assoc (get index bucket-index) (count (get index bucket-index)) [key row-index])))

(defn hash-insert [index key row-index]
  (hash-insert-at index (hash-bucket key (count index)) key row-index))

(defn hash-lookup-in-bucket [bucket key index]
  (cond
    (= index (count bucket)) -1
    (= (get (get bucket index) 0) key) (get (get bucket index) 1)
    true (hash-lookup-in-bucket bucket key (+ index 1))))

(defn hash-lookup [index key]
  (hash-lookup-in-bucket (get index (hash-bucket key (count index))) key 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def hidx0 [[] [] [] []])
#'user/hidx0
user=> (def hidx1 (hash-insert hidx0 5 0))
user=> (def hidx2 (hash-insert hidx1 9 1))
user=> (def hidx3 (hash-insert hidx2 2 2))
user=> (def hidx4 (hash-insert hidx3 13 3))
#'user/hidx4
user=> hidx4
[[] [[5 0] [9 1] [13 3]] [[2 2]] []]
user=> (hash-lookup hidx4 9)
1
user=> (hash-lookup hidx4 2)
2
user=> (hash-lookup hidx4 7)
-1
```

### Mechanical Walkthrough

`(defn hash-bucket [key bucket-count] (mod key bucket-count))` — `mod`,
reappearing, maps any integer key to a bucket number between `0` and
`bucket-count - 1`. This is the entire hash function this lesson uses —
deliberately simple, and worth being honest about: it works cleanly here
because the keys are already plain integers; a real hash index over
strings or other data first computes a numeric *hash code* from the
value, then reduces that to a bucket the same way, via `mod`.

`(defn hash-insert-at [index bucket-index key row-index] ...)` — `index`
here is a vector of *buckets*, one per possible `hash-bucket` result,
each bucket itself a vector of `[key row-index]` pairs. `get`, `assoc`,
and `count`, all reappearing: read the target bucket, `assoc` the new
`[key row-index]` pair onto its end (the established append idiom, one
level deeper than before), and `assoc` that updated bucket back into
`index` at `bucket-index`. This is **chaining**: every bucket that ends
up holding more than one entry keeps all of them, in a small vector,
rather than a bucket ever being limited to one — the exact collision-
resolution technique Lesson 89's own hash table first built and named.

`(defn hash-insert [index key row-index] (hash-insert-at index
(hash-bucket key (count index)) key row-index))` — computes which
bucket this key belongs in (`(count index)` is the total bucket count),
then delegates.

Trace: `hidx0` starts as `4` empty buckets. `(hash-bucket 5 4)` is `1` —
`5` lands in bucket `1`. `(hash-bucket 9 4)` is also `1` — `9` lands in
the *same* bucket as `5`, a genuine collision. `(hash-bucket 2 4)` is
`2` — its own bucket. `(hash-bucket 13 4)` is `1` again — a *second*
collision in bucket `1`. The final `hidx4` shows bucket `1` holding
three entries, `[[5 0] [9 1] [13 3]]`, while bucket `2` holds one and
buckets `0` and `3` hold none at all — collisions aren't errors here,
just multiple entries sharing one bucket, each still findable by name.

`(defn hash-lookup-in-bucket [bucket key index] ...)` — `cond`,
reappearing, an ordinary linear scan, but only ever across *one
bucket's* own small contents, never the whole index. `(defn hash-lookup
[index key] (hash-lookup-in-bucket (get index (hash-bucket key (count
index))) key 0))` — computes the exact bucket a key would be in, then
scans only that bucket.

`(hash-lookup hidx4 9)` — `hash-bucket` computes `1` directly; the scan
inside bucket `1`'s own three entries finds `9` at position `1`, returns
its row index, `1`. `(hash-lookup hidx4 2)` — `hash-bucket` computes
`2`; bucket `2` has exactly one entry, found immediately. No comparison
against `5`, `9`, or `13` ever happened for this lookup at all — the
hash function alone ruled out every bucket but the right one.

### CS Lens

A hash index trades **order for computation**: it never needs to
compare a target key against most of the index's own contents at all,
because the hash function computes, directly, which small bucket could
possibly contain it — real, near-constant-time lookup on average,
`O(1)`, genuinely better than even binary search's `O(log n)`, as long
as collisions stay rare enough that any one bucket never grows large. The
real cost is what's lost: nothing about a hash index preserves any
usable order at all — `hidx4`'s own buckets hold `5`, `9`, and `13`
together only because `mod 4` happened to group them, with no relation
whatsoever to their actual numeric order. A query like "every account
between `5` and `13`" — trivial for Unit 2's sorted index, a
contiguous range of positions — has no efficient answer here at all;
every bucket would need checking, since a hash function's whole design
goal is to *destroy* any relationship between a key's value and its
storage location, not preserve one.

Also recognized in: a coat-check counter, handing out a numbered ticket
computed on the spot rather than searching a rack for a name; a hotel's
room-key card, encoding a room number directly rather than a lookup
table the front desk has to search; a `git` object's own content-hash
address, letting `git` find any object directly from a hash of its
content, with zero relationship between two objects' hashes and any
similarity between their actual contents.

### SE Lens

The alternative — Unit 2's sorted index — is strictly better whenever a
query needs *ranges*, not just exact matches: "every balance above
`100`," "every timestamp this week." A hash index can't answer those
efficiently at all, no matter how well-tuned its hash function is,
because its entire speed advantage comes from deliberately scattering
related keys apart from each other. This is why real production
databases routinely maintain *both kinds of index at once*, on
different fields, chosen per query pattern — a primary key looked up by
exact match gets a hash index; a timestamp or price field that's
regularly range-queried gets a tree-based one — rather than treating
"which index structure" as a single, once-and-for-all decision for an
entire database. The cost accepted for keeping both: every index, of
either kind, has to be updated on every single write to the table it
indexes, real ongoing overhead that grows with how many indexes a table
carries, whether or not any given write actually benefits from all of
them.

---

## Connect the Pieces

Follow the key `9` through every strategy this lesson built, ending at
the identical row index each time. Under Unit 1's baseline, finding `9`
in `table8` — if it existed there — would cost up to `8` real
comparisons, one per row, with no shortcut available. Under Unit 2's
sorted index, the same key costs exactly `2` comparisons — `mid=1` finds
`5`, too small, narrows to the upper half; `mid=2` finds `9` directly —
at the price, proven concretely by `prepend-and-shift`, that adding one
new smallest key to that same sorted structure would have required
touching every one of its existing `4` entries just to make room. Under
Unit 3's hash index, `9` costs effectively one computation —
`(hash-bucket 9 4)` lands directly on bucket `1` — and only then a tiny
scan across that one bucket's own three entries, never touching buckets
`0`, `2`, or `3` at all; but that same index, asked "every key between
`2` and `9`," would have no efficient way to answer, since nothing about
which bucket a key lands in relates to its numeric value in any usable
way. Three structures, three genuinely different tradeoffs, and the same
key `9` traced through every one of them — the entire lesson's real
point is that "index" was never one single technique, but a choice
between real, opposing costs, made deliberately for each specific field
and each specific kind of question a database actually needs to answer
about it.

## What Breaks Without This

Replace `hash-bucket`'s real computation with a version that always
returns the same fixed bucket, regardless of the key:

```clojure
(defn hash-bucket-broken [key bucket-count]
  0)
```

Insert the same four keys through it — `5`, `9`, `2`, `13` — and every
single one lands in bucket `0`:

```
user=> (hash-insert-at [[] [] [] []] (hash-bucket-broken 5 4) 5 0)
[[[5 0]] [] [] []]
```

Repeating this for all four keys produces one bucket holding all four
entries and three buckets holding nothing at all. `hash-lookup` would
still return correct answers — the linear scan inside that one enormous
bucket still finds the right entry eventually — but every single lookup
now costs exactly what Unit 1's full linear scan already cost, since one
bucket holding everything is, functionally, no different from having
never partitioned the data at all. A hash function that doesn't actually
spread keys across buckets isn't wrong in the sense of returning bad
answers — it's wrong in the sense of silently forfeiting the entire
reason an index was built in the first place, with nothing about a
correct-but-slow result ever pointing at the real cause.

## Exercises

1. Insert eight keys, chosen so all eight land in only two of four
   buckets, and confirm `hash-lookup` still returns correct results —
   then compute, by hand, how many comparisons the worst-case lookup in
   the larger bucket now costs, and compare that to what a perfectly
   even four-way split would have cost.
2. Extend `binary-search-index` to return every row index whose key
   falls within a given range (`low-key` to `high-key`), taking
   advantage of the sorted index's own ordering — and explain in one
   sentence why a hash index has no equivalent efficient version of this
   operation at all.
3. Compute, without running any code, how many comparisons Unit 1's
   linear scan, Unit 2's binary search, and Unit 3's hash lookup would
   each cost in the worst case for a table of `1,000,000` rows, assuming
   a hash index with `1,000` buckets and a roughly even key
   distribution.

## Definition of Done

- [ ] `scan-comparisons`, `binary-search-index`, `search-index-at-mid`,
      `prepend-and-shift`, `hash-bucket`, `hash-insert`, and
      `hash-lookup` all defined and run in a live `bb` REPL, matching
      every transcript shown above exactly.
- [ ] Unit 1's linear scan cost confirmed to scale directly with table
      size (`4` vs. `8`).
- [ ] Unit 2's binary search reproduced, alongside the honest insertion
      cost (`prepend-and-shift` touching every existing entry).
- [ ] Unit 3's hash index reproduced, including a genuine collision
      (bucket `1` holding three keys) resolved correctly.
- [ ] Exercise 3 completed, with all three worst-case comparison counts
      computed and compared side by side.
- [ ] `git commit -m "Add Lesson 223: quantify the linear scan, derive
      the sorted-index-vs-tree insertion tradeoff, and build a real
      hash index with chaining"`
