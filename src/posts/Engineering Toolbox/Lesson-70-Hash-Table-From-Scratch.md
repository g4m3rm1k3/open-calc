# Lesson 70: One Key, One Guaranteed Address — Hash Tables from Scratch

**What you will build:** a `HashTable` class with `put`, `get`, and
`delete`, built entirely from a Python list, no `dict` involved. The
working feature is a key–value store that stays fast no matter how many
items are in it. The transferable problem underneath it: how do you
turn "where is this thing?" from a *search* into a *calculation* — so
lookup cost stops growing with the size of the data.

**What you need to know first:** Lesson 13 (Find duplicate files by
hash) — you already used a hash function to fingerprint file contents;
this lesson reuses that same idea (a hash function) but for a new
purpose: not detecting duplicates, but computing *where to store
something*. Nothing else is assumed.

---

## Concept Unit: The Problem — Search Shouldn't Get Slower as Data Grows

### The Problem

A plain Python list of `(key, value)` pairs works as a key-value store —
`put` appends, `get` walks the list checking each key. It's correct. It
also gets slower, in direct proportion to how much data is in it,
because finding anything means checking entries one at a time until a
match turns up (or the list runs out). For 20 pairs that's invisible.
For 200,000, it isn't.

### The New Code

```python
import time

# A plain list of 200,000 (key, value) pairs, unsorted, like a naive database.
records = [(f"user{i}", i * 7) for i in range(200_000)]

def linear_lookup(records, target_key):
    for key, value in records:
        if key == target_key:
            return value
    return None

start = time.perf_counter()
result = linear_lookup(records, "user199999")   # worst case: last item
elapsed = time.perf_counter() - start

print(f"Found: {result}")
print(f"Checked up to {len(records)} pairs")
print(f"Time: {elapsed*1000:.3f} ms")
```

This is throwaway — it exists only to measure the cost, and it's
discarded now; it never becomes part of `HashTable`.

### Run It

```
Found: 1399993
Checked up to 200000 pairs
Time: 5.008 ms
```

### Mechanical Walkthrough

- `records = [(f"user{i}", i * 7) for i in range(200_000)]` — a list
  comprehension building 200,000 tuples. Already-established syntax;
  no restatement owed.
- `linear_lookup` walks `records` with a `for key, value in records`
  loop, **unpacking each tuple into two names in one step** — first
  appearance of tuple unpacking inside a `for` loop. It works because
  each element of `records` is itself a 2-item tuple, and Python
  matches the loop's two loop-variables against that tuple's two
  positions on every iteration.
- `time.perf_counter()` — first appearance. A monotonic clock meant
  specifically for measuring elapsed time (unlike `time.time()`, it's
  not tied to wall-clock time and can't jump backward from a system
  clock adjustment). Calling it twice and subtracting gives elapsed
  seconds.
- Everything else (`return`, f-strings, `len()`) is already
  established.

### CS Lens

This is **linear search** — cost proportional to the number of items,
written `O(n)`. Also recognized in: scanning a phone book page by page
instead of using the alphabetical index, a database doing a full table
scan instead of using an index, a network switch flooding a packet to
every port because it doesn't know which one the destination is on.

### SE Lens

The alternative isn't "write cleverer search code" — no amount of
cleverness turns a scan into anything but a scan. The real alternative,
which the rest of this lesson builds, is changing the *data structure*
so that "where is it?" is answered by a calculation instead of a
search. That's the whole point of what follows.

---

## Concept Unit: The Built-in `hash()` Function

### The Problem

To calculate where a key belongs instead of searching for it, we need
some way to turn an arbitrary key — a string, a number, anything — into
a number we can do arithmetic on. Python already has this built in.

### The New Code

```python
print(hash("apple"))
print(hash("apple"))     # same string, same session -> same hash
print(hash("banana"))
print(hash(42))
print(hash(42) == 42)    # small ints hash to themselves
```

### Run It

```
-2003999543335776700
-2003999543335776700
9055713597657429380
42
True
```

This is called a **hash function**: it takes any hashable value and
returns a fixed-size integer, and calling it on the same value always
returns the same integer.

### One Fact Worth Stopping For

Run that same file again in a brand-new terminal and `hash("apple")`
will very likely print a *different* number than it did here. Python
deliberately **randomizes string hashes on every process start**
(controlled by an internal seed) specifically so an attacker can't
predict which keys will collide and deliberately flood a server's hash
table with them — a real attack class called hash-flooding /
algorithmic-complexity DoS. For every hash value shown for the rest of
this lesson to be reproducible on your machine too, all code from here
on was run with that randomization pinned to a fixed seed
(`PYTHONHASHSEED=0`). In normal use you never set this — it's a
teaching-reproducibility detail, not something `HashTable` itself needs
to care about.

### Discarded

This lab is deleted now. `hash()` itself survives — it's a language
built-in, not project code — but this specific demonstration file does
not appear in the project again.

### CS Lens

A hash function's only hard requirement is **determinism**: same input,
same output, every time within a run. Also recognized in: Lesson 13's
own duplicate-file detector (hashing file contents to fingerprint
them), Git's commit IDs, checksums on a downloaded file, a cache key
computed from a request's parameters.

---

## Concept Unit: Reducing a Hash to a Bucket Index

### The Problem

`hash("apple")` returns `-2003999543335776700` — enormous, and
sometimes negative. We can't allocate an array with that many slots. We
need a small, non-negative number that fits inside an array we can
actually build — say, 8 slots.

### The New Code

```python
table_size = 8

for key in ["apple", "banana", "cherry"]:
    h = hash(key)
    index = h % table_size
    print(f"key={key!r:10} hash={h:22} index={index}")
```

### Run It

```
key='apple'    hash=  -2003999543335776700 index=4
key='banana'   hash=   9055713597657429380 index=4
key='cherry'   hash=   7210250968819977926 index=6
```

Two things worth naming here, both **first appearances**:

- `h % table_size` — the **modulo operator**, giving the remainder
  after division. Any integer, divided by 8, leaves a remainder between
  0 and 7 — exactly the range of valid indexes into an 8-slot array.
  This is called **compression**: shrinking an arbitrarily large hash
  down to a small index range without losing the property that the
  same key always lands on the same index.
- Notice `hash("apple")` is *negative*, but `index` printed as `4`, not
  negative. That's not an accident of these specific numbers — it's a
  language-level fact worth stating flatly: **Python's `%` always
  returns a result with the same sign as the divisor** (here, positive,
  since `table_size` is positive), even when the left-hand side is
  negative. In C, `%` on a negative number can return a negative
  result — the exact same expression would need extra handling there
  to be safely used as an array index. Nothing to fix here; just a
  fact to know before trusting `%` as an index in a new language.

### Discarded

This lab is deleted now; `table_size` and the print loop don't appear
in the project again — but the calculation itself, `hash(key) %
table_size`, is exactly what `HashTable.put` will use next.

### One More Fact Worth Naming Now

`apple` and `banana` both landed on index `4`. That's not a bug in this
lab — it's the expected, unavoidable situation this whole lesson is
really about: two different keys computing the *same* index. That's
called a **collision**, and every hash table design lives or dies on
how it handles this. The next several units build exactly that.

### CS Lens

Reducing an unbounded space (all possible hash values) down to a fixed
range (array indices) while trying to spread inputs evenly across that
range is the same underlying problem as: load balancers assigning
requests to a fixed pool of servers, CPU caches mapping memory
addresses to a fixed number of cache lines, and consistent hashing in
distributed databases assigning keys to a fixed ring of nodes.

---

## Concept Unit: The Bucket Array

### The Problem

We now know how to compute an index for any key. We need something to
actually put *at* that index — an array-like structure sized to hold
however many slots we decide on, where each slot can hold more than one
item (because, as just shown, collisions are guaranteed to happen
eventually).

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch addition. Nothing earlier in the curriculum built a
  hash table; Lesson 13 used hashing for fingerprinting, not storage.
- **Files affected:** `hashtable.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file, nothing to locate a position
  within.
- **Dependencies:** none beyond the standard library.

### The New Code

```python
class HashTable:
    def __init__(self, size=8):
        self.size = size
        self.buckets = [[] for _ in range(size)]
```

### Run It

```python
>>> from hashtable import HashTable
>>> t = HashTable()
>>> t.buckets
[[], [], [], [], [], [], [], []]
>>> len(t.buckets)
8
```

### Mechanical Walkthrough

- `class HashTable:` — already-established syntax (classes were built
  from scratch back in earlier lessons).
- `def __init__(self, size=8):` — a constructor with a **default
  argument value**, already established.
- `self.size = size` — storing the requested table size as an
  attribute; already-basic.
- `self.buckets = [[] for _ in range(size)]` — a list comprehension
  building a list of `size` **separate, independent empty lists**.
  This is worth a real pause even though list comprehensions are
  already known: the thing being comprehended over is `range(size)`,
  used only to repeat the action `size` times — `_` is the
  conventional name for "a loop variable I'm not going to use," a
  reappearing idiom, not a new concept. What *is* new here: writing
  `[[] for _ in range(size)]` instead of `[[]] * size`. The two look
  similar but are not equivalent — the second would create one empty
  list object and repeat the *same reference* to it `size` times, so
  appending to `buckets[0]` would silently also change `buckets[1]`
  through `buckets[7]`, because they'd all be the same object. The
  comprehension calls `[]` fresh on every iteration, so each bucket is
  its own independent list. This distinction is worth proving, not
  just asserting:

```python
>>> shared = [[]] * 3
>>> shared[0].append("x")
>>> shared
[['x'], ['x'], ['x']]
>>> separate = [[] for _ in range(3)]
>>> separate[0].append("x")
>>> separate
[['x'], [], []]
```

That's a real, runnable proof, not a claim taken on faith: the first
version leaks a change across all three slots; the comprehension
doesn't.

### CS Lens

An array where each slot can hold a *collection* rather than a single
value — so a collision doesn't overwrite anything, it just adds a
second item to that slot's collection — is the core idea behind
**separate chaining**, one of the two standard ways hash tables handle
collisions (the other, open addressing, probes for a different empty
slot instead; this lesson uses chaining because it's the more direct
extension of what a "bucket" already suggests).

### SE Lens

Fixing `size=8` as a default is a real, deliberate tradeoff, not an
oversight: a bigger default wastes memory for a table that ends up
holding three items; a smaller one means more collisions sooner. The
alternative — start small and grow automatically as items are added —
is a real technique (**dynamic resizing**, the same idea behind Lesson
68's dynamic array) and this lesson's closing section shows exactly
what breaks without it. It isn't implemented here; it's flagged as
debt this version of `HashTable` is knowingly carrying, and left as an
exercise.

This unit connects directly to the previous one: the bucket array is
where the index computed by `hash(key) % table_size` actually points.

---

## Concept Unit: Insert — `put()` and Updating in Place

### The Problem

We have somewhere to put things. Now: actually storing a key-value
pair at its computed index, and — because keys must stay unique in a
key-value store — updating the value if the key is already present
instead of adding a second copy of it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as the previous unit.
- **Files affected:** `hashtable.py`.
- **Change type:** add.
- **Location:** inside `HashTable`, immediately after `__init__` from
  the previous unit.
- **Dependencies:** the `self.buckets` array from the previous unit.

### The New Code

```python
    def put(self, key, value):
        index = hash(key) % self.size
        bucket = self.buckets[index]
        for i, (existing_key, _) in enumerate(bucket):
            if existing_key == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))
```

### The Updated Project

```python
class HashTable:
    def __init__(self, size=8):
        self.size = size
        self.buckets = [[] for _ in range(size)]

    def put(self, key, value):                                    # ← new
        index = hash(key) % self.size                             # ← new
        bucket = self.buckets[index]                               # ← new
        for i, (existing_key, _) in enumerate(bucket):             # ← new
            if existing_key == key:                                # ← new
                bucket[i] = (key, value)                            # ← new
                return                                              # ← new
        bucket.append((key, value))                                # ← new
```

`HashTable` now goes from "an empty array of empty buckets" to "a
working write path": given any key and value, it computes exactly one
bucket to look in, checks that bucket for an existing copy of the key,
and either overwrites that copy or appends a new one — never both.

### Mechanical Walkthrough

- `index = hash(key) % self.size` — a **hard concept reappearing**:
  exactly the compression calculation proved in the modulo unit above,
  now applied to `self.size` instead of a hardcoded `8`.
- `bucket = self.buckets[index]` — indexing into the bucket array;
  already-basic. Worth naming what this variable *is*, though: `bucket`
  isn't a copy — it's a reference to the same list object living inside
  `self.buckets`, so mutating `bucket` below (via `bucket[i] = ...` or
  `bucket.append(...)`) mutates the real table, not a throwaway copy.
- `for i, (existing_key, _) in enumerate(bucket):` — **two things
  compounded in one line, both worth separating.** `enumerate(bucket)`
  is a first appearance: it walks a list while also handing back each
  item's position, so the loop gets both `i` (the index within this
  bucket) and the item itself on every pass — needed here because, to
  overwrite an existing pair, we need to know *where* in the bucket it
  lives, not just what it is. The second half, `(existing_key, _)`, is
  the same tuple-unpacking already proven in the linear-search lab,
  reused here to pull `existing_key` out of each `(key, value)` pair
  while explicitly discarding the value with `_` — we don't need it
  yet at this point in the loop.
- `if existing_key == key:` — already-basic comparison.
- `bucket[i] = (key, value)` — **replacing** the tuple at position `i`
  in place. This is the actual "update, don't duplicate" behavior: if
  the key already exists in this bucket, its old `(key, value)` tuple
  is overwritten with a new one holding the new value, at the same
  position.
- `return` — exits `put` immediately once an update has happened, so
  execution never reaches the `append` below it for this case.
- `bucket.append((key, value))` — only runs if the loop finished
  without finding a match (i.e., the key is genuinely new to this
  bucket): adds a new `(key, value)` tuple to the end of the bucket
  list. Already-basic method, first time used on a bucket specifically.

### Execution Trace

```python
t = HashTable()
t.put("apple", 1)
t.put("banana", 2)
t.put("apple", 99)
```

1. `t.put("apple", 1)` — `hash("apple") % 8` computes to `4` (proven in
   the modulo unit above); `self.buckets[4]` is `[]`, so the loop over
   an empty bucket runs zero times and falls through to `append`,
   leaving `buckets[4] = [("apple", 1)]`.
2. `t.put("banana", 2)` — `hash("banana") % 8` also computes to `4`
   (the collision already proven above); the loop checks the one
   existing entry, `("apple", 1)` — `"apple" == "banana"` is `False` —
   so it falls through to `append` too, leaving
   `buckets[4] = [("apple", 1), ("banana", 2)]`.
3. `t.put("apple", 99)` — index `4` again; this time the loop's first
   iteration finds `existing_key == "apple"` true at `i = 0`, so
   `bucket[0] = ("apple", 99)` overwrites in place and `return` exits
   before `append` ever runs. Result: `buckets[4] = [("apple", 99),
   ("banana", 2)]` — two entries, not three, because the update path
   was taken instead of the insert path.

### Run It

```
0 []
1 []
2 []
3 []
4 [('apple', 99), ('banana', 2)]
5 []
6 []
7 []
```

That's the real state of `t.buckets` after the three calls above,
printed bucket by bucket — matching the trace exactly: one bucket
holding two entries, `apple` updated to `99` in place, `banana`
untouched.

### CS Lens

Checking for an existing key before writing — so the same operation
means "insert if absent, otherwise update" — is the pattern most
languages call an **upsert**. Also recognized in: SQL's `INSERT ... ON
CONFLICT UPDATE`, a cache's `set(key, value)` overwriting a stale
entry, `dict.__setitem__` itself (this is, in miniature, what `d[key]
= value` does on a real Python dict internally).

### SE Lens

The alternative — always `append`, never check — is simpler code but a
silently broken key-value store: `get` would only ever find the
*first* match in a bucket, so later updates would exist in memory but
be permanently unreachable, a real memory leak with no error to signal
it. Checking first costs a linear scan of *one bucket* (not the whole
table) on every write — a real cost, but one bucket's worth, not the
whole table's, which is the entire reason bucketing exists.

---

## Concept Unit: Lookup — `get()` and the Miss Case

### The Problem

Insert is only half a key-value store. We need to retrieve a value by
key — and to fail honestly, not silently, when the key was never
stored.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `hashtable.py`.
- **Change type:** add.
- **Location:** inside `HashTable`, immediately after `put` from the
  previous unit.
- **Dependencies:** the `put` method above (so there's something to
  retrieve).

### The New Code

```python
    def get(self, key):
        index = hash(key) % self.size
        bucket = self.buckets[index]
        for existing_key, value in bucket:
            if existing_key == key:
                return value
        raise KeyError(key)
```

### The Updated Project

```python
class HashTable:
    def __init__(self, size=8):
        self.size = size
        self.buckets = [[] for _ in range(size)]

    def put(self, key, value):
        index = hash(key) % self.size
        bucket = self.buckets[index]
        for i, (existing_key, _) in enumerate(bucket):
            if existing_key == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))

    def get(self, key):                                            # ← new
        index = hash(key) % self.size                              # ← new
        bucket = self.buckets[index]                                # ← new
        for existing_key, value in bucket:                          # ← new
            if existing_key == key:                                 # ← new
                return value                                         # ← new
        raise KeyError(key)                                          # ← new
```

`HashTable` is now a complete read/write pair: `put` computes an index
and writes there; `get` computes the *same* index for the *same* key
and reads from there — the whole reason both methods independently
recompute `hash(key) % self.size` instead of one storing it for the
other is that recomputing it is how `get` finds what `put` already
placed, without needing any shared state beyond the key itself.

### Mechanical Walkthrough

- `index = hash(key) % self.size` and `bucket = self.buckets[index]` —
  **hard concepts reappearing**, identical to `put`'s first two lines:
  the same compression calculation, the same bucket lookup.
- `for existing_key, value in bucket:` — tuple unpacking, already
  established (twice now: the linear-search lab, and `put`'s own
  loop). One real difference from `put`'s loop worth naming: this one
  doesn't use `enumerate` — `get` never needs to know a match's
  *position* in the bucket, only its value, so there's no reason to
  carry an index it won't use.
- `if existing_key == key: return value` — on a match, returns
  immediately with the stored value, already-basic.
- `raise KeyError(key)` — **first appearance.** If the loop finishes
  without finding the key, this raises Python's own built-in
  `KeyError` exception, with the missing key as its message — the same
  exception a real `dict` raises on `d[missing_key]`. Raising a named,
  specific exception (rather than, say, silently returning `None`) is
  what lets calling code tell "the key is missing" apart from "the key
  legitimately maps to the value `None`" — a real ambiguity a
  silent-`None` design would create.

### Run It

```python
>>> from hashtable import HashTable
>>> t = HashTable()
>>> t.put("apple", 1)
>>> t.put("banana", 2)
>>> t.get("apple")
1
>>> t.get("banana")
2
>>> t.get("cherry")
Traceback (most recent call last):
  ...
KeyError: 'cherry'
```

The real output confirms exactly this: `apple` and `banana` come back
correctly, and asking for a key that was never `put` raises `KeyError`
rather than returning something that could be mistaken for a real
stored value.

### CS Lens

Raising a specific, named error on a missing key — rather than
returning a sentinel value like `None` or `-1` that could also be a
legitimate result — is sometimes called **failing loudly**. Also
recognized in: array bounds-checking raising `IndexError` instead of
returning garbage memory, a network client raising a timeout exception
instead of returning an empty response indistinguishable from "the
server said nothing," a parser raising a syntax error instead of
silently guessing what the author meant.

### SE Lens

The alternative — `return None` on a miss — reads as simpler code but
pushes an ambiguity onto every caller forever: they'd have to remember
that `None` might mean "missing" *or* "the value genuinely is `None`,"
and get that distinction right at every call site, with no help from
the language if they forget. Raising `KeyError` moves that
responsibility to exactly one place — the caller either catches it
explicitly (as shown above) or lets the crash happen loudly, which is
strictly easier to debug than a wrong answer that looks like a right
one.

---

## Concept Unit: Delete

### The Problem

A complete key-value store needs to remove entries, not just add and
read them — and removing one key from a bucket must not disturb any
other key sharing that same bucket.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `hashtable.py`.
- **Change type:** add.
- **Location:** inside `HashTable`, immediately after `get` from the
  previous unit.
- **Dependencies:** `put` (something to delete).

### The New Code

```python
    def delete(self, key):
        index = hash(key) % self.size
        bucket = self.buckets[index]
        for i, (existing_key, _) in enumerate(bucket):
            if existing_key == key:
                del bucket[i]
                return
        raise KeyError(key)
```

### The Updated Project

```python
class HashTable:
    def __init__(self, size=8):
        self.size = size
        self.buckets = [[] for _ in range(size)]

    def put(self, key, value):
        index = hash(key) % self.size
        bucket = self.buckets[index]
        for i, (existing_key, _) in enumerate(bucket):
            if existing_key == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))

    def get(self, key):
        index = hash(key) % self.size
        bucket = self.buckets[index]
        for existing_key, value in bucket:
            if existing_key == key:
                return value
        raise KeyError(key)

    def delete(self, key):                                          # ← new
        index = hash(key) % self.size                                # ← new
        bucket = self.buckets[index]                                  # ← new
        for i, (existing_key, _) in enumerate(bucket):                # ← new
            if existing_key == key:                                   # ← new
                del bucket[i]                                           # ← new
                return                                                   # ← new
        raise KeyError(key)                                              # ← new
```

`HashTable` is now feature-complete for basic use: `put`, `get`, and
`delete` all independently recompute the same `hash(key) % self.size`
to agree on which bucket a key lives in, and all three walk that one
bucket — never the whole table — to find, write, read, or remove a
specific key.

### Mechanical Walkthrough

- `index = hash(key) % self.size`, `bucket = self.buckets[index]`, the
  `enumerate` loop, and `(existing_key, _)` unpacking — all **hard
  concepts reappearing**, identical in form to `put`'s own version:
  same compression calculation, same need for a position (`i`) because
  deletion, like update, has to act on one specific slot in the
  bucket.
- `del bucket[i]` — **first appearance.** The `del` statement removes
  the element at index `i` from the `bucket` list entirely — not
  setting it to `None` or any placeholder, actually shrinking the
  list's length by one and shifting every later element down one
  position. Because `bucket` is a reference into `self.buckets` (as
  established in the `put` unit), this mutates the real table.
- `raise KeyError(key)` — reappearing from `get`, same reasoning: fail
  loudly on a key that was never present, rather than silently doing
  nothing.

### Execution Trace

```python
t = HashTable()
t.put("apple", 1)
t.put("banana", 2)
t.delete("apple")
```

1. `t.put("apple", 1)` and `t.put("banana", 2)` — as traced in the
   insert unit, both land in bucket `4`: `buckets[4] = [("apple", 1),
   ("banana", 2)]`.
2. `t.delete("apple")` — index `4` again; the loop finds
   `existing_key == "apple"` true at `i = 0`; `del bucket[0]` removes
   that entry and shifts `("banana", 2)` down to position `0`, leaving
   `buckets[4] = [("banana", 2)]`. `banana` was never touched by name —
   it moved position only because the list shrank underneath it, which
   is exactly why `get` and `delete` always search by comparing
   `existing_key == key`, never by trusting a remembered position.

### Run It

```python
>>> from hashtable import HashTable
>>> t = HashTable()
>>> t.put("apple", 1)
>>> t.put("banana", 2)
>>> t.delete("apple")
>>> t.buckets[4]
[('banana', 2)]
>>> t.get("banana")
2
>>> t.get("apple")
Traceback (most recent call last):
  ...
KeyError: 'apple'
```

Matches the trace exactly: `banana` survives, correctly, at the value
it was given; `apple` is genuinely gone, not just hidden, confirmed by
the `KeyError` on a repeat lookup.

### CS Lens

Removing an item from a shared bucket without disturbing its
neighbors — by comparing on identity/equality rather than trusting a
fixed position — is the same discipline behind any structure sharing
storage across multiple logical entries: a database deleting one row
from a page holding several rows, an OS freeing one process's memory
without corrupting its neighbor's, a linked list's own delete (Lesson
68) unlinking one node without breaking the chain around it.

### SE Lens

`del bucket[i]` on a Python list is itself an `O(bucket length)`
operation — it has to shift every later element down by one. For a
short bucket (the whole point of sizing the table well) that cost is
negligible; for a badly undersized table with buckets holding
thousands of items, both the search *and* the deletion shift become
real costs. That's not a new problem — it's the same load-factor issue
the next section measures directly.

---

## Connect the Pieces

One full trace, start to finish, through every unit built in this
lesson — inserting, colliding, updating, reading, and deleting, on the
real class:

```python
from hashtable import HashTable

t = HashTable(size=8)
t.put("apple", 1)     # bucket 4 -> [("apple", 1)]
t.put("banana", 2)    # bucket 4 -> [("apple", 1), ("banana", 2)]  (collision)
t.put("apple", 99)    # bucket 4 -> [("apple", 99), ("banana", 2)] (update, not append)
t.get("banana")        # -> 2
t.delete("apple")      # bucket 4 -> [("banana", 2)]
t.get("apple")          # -> raises KeyError
```

Every one of those six lines does the same first step —
`hash(key) % self.size` — and then diverges based purely on which
method was called: `put` writes (insert-or-update), `get` reads,
`delete` removes. None of them ever look outside the one bucket that
calculation points to. That's the entire design: turn "where is this
key?" from a search over everything into a calculation that points at
one small place, every time.

## What Breaks Without This — Sizing Actually Matters

Everything above used `size=8` for clarity. Here's the same class,
loaded with 200,000 items, at two different sizes, to show what
happens when the table is too small for what it's holding:

```python
# size=8, 200,000 items
t = HashTable(size=8)
for i in range(200_000):
    t.put(f"user{i}", i * 7)

t.get("user199999")   # timed
```

```
Found: 1399993
Time: 2.73796 ms
Bucket sizes (size=8): [24787, 25038, 25119, 24851, 24971, 24953, 25288, 24993]
Longest bucket: 25288
```

Every bucket ended up holding roughly 25,000 items — because there are
only 8 buckets for 200,000 keys, `get` is still walking a list of
~25,000 tuples on every call. That's not `O(1)` in any meaningful
sense; it's `O(n / 8)`, which is still `O(n)` — the table-size constant
just made the linear search 8 times faster, not fundamentally
different. Compare the *same class, same 200,000 items*, sized
properly this time:

```python
t = HashTable(size=262144)   # roomy: ~1 item per bucket at 200k items
for i in range(200_000):
    t.put(f"user{i}", i * 7)

t.get("user199999")   # timed
```

```
Found: 1399993
Time: 0.00917 ms
Longest bucket: 8
```

Same code, same data, same key being looked up — **300x faster**,
purely from table size. This is called **load factor**: the ratio of
items stored to number of buckets. A real hash table (Python's own
`dict` included) tracks this ratio continuously and automatically grows
its internal array — reinserting every existing key into a bigger table
— once load factor crosses a threshold, so it never has to be tuned by
hand like `size=262144` was here. This lesson's `HashTable` does not
do that: picking the right `size` up front is a real limitation it's
knowingly carrying, and building automatic resizing (using Lesson 68's
dynamic-array-growth idea, applied here to `self.buckets` instead of a
flat array) is the natural next exercise.

## Exercises

- Add a `__len__` method returning the total number of stored items
  across all buckets (not the number of buckets).
- Add a `__contains__` method so `"apple" in t` works, without raising
  `KeyError` for a miss.
- Deliberately set `size=1` and insert 50 keys — confirm it still
  works correctly (every key still findable), just slowly. Time it
  against `size=64` for the same 50 keys to feel the difference at a
  small, safe scale before trusting the 200,000-item numbers above.
- Implement automatic resizing: when load factor (`item_count /
  self.size`) exceeds `0.75`, double `self.size`, build a new,
  empty `self.buckets` of that size, and re-`put` every existing
  key-value pair into it.

## Definition of Done

- [ ] `HashTable.put`, `.get`, and `.delete` all implemented and run,
      matching the traces and output shown above.
- [ ] Collision between `"apple"` and `"banana"` at `size=8`
      reproduced on your own machine (with `PYTHONHASHSEED=0` set, or
      any two keys that collide at your table's default size).
- [ ] `get` on a missing key raises `KeyError`, confirmed by actually
      triggering it, not just reading the `raise` line.
- [ ] The 8-bucket vs. 262,144-bucket timing comparison run for real,
      with your own numbers pasted somewhere you can find them again.
- [ ] Committed, with a message explaining *why* — e.g. `"Hash table
      from scratch: O(1) lookup by trading search for a computed
      index, with chaining to survive collisions"` — not `"add
      hashtable.py"`.
