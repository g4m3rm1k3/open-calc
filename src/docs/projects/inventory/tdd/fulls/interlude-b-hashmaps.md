# Interlude B: Hash Maps, Built From Scratch

**What you will build**
A working hash map implemented in plain Python, from nothing — no `dict`, no library. The problem we're solving: you've used dicts constantly, and Lesson 3 mentioned SQLite's primary key lookups are "similar in spirit" to a hash map — but "similar in spirit" isn't understanding. Building one yourself, badly at first, is what makes the O(1) claim something you've verified rather than something you've memorized.

**What you need to know first**
Lesson 3 (`WHERE id = ?`, primary key lookups). Big-O intuition begins here and gets formalized in Lesson 10.

**Exemption from the failing-test-first rule:** this is a from-scratch data structure exercise with no application feature to spec — each unit demonstrates a concrete behavior instead.

---

## Concept Unit: The Cost of Linear Search

### The Problem

Given a list of usernames, "does `'grace'` appear in this list" has an obvious answer: check each one in order until you find it or run out. That's correct — but how expensive is it, precisely, and how does that cost change as the list grows?

### Demonstrate the behavior

Create `lab_linear.py`:

```python
usernames = [f"user{i}" for i in range(100_000)]
usernames.append("grace")  # worst case: at the very end

comparisons = 0
target = "grace"
for name in usernames:
    comparisons += 1
    if name == target:
        break

print(f"Found after {comparisons} comparisons out of {len(usernames)} items")
```

Run it:

```bash
python lab_linear.py
```

Output:

```text
Found after 100001 comparisons out of 100001 items
```

*What this proves:* finding `"grace"` cost one comparison per item, because it happened to be last. Double the list, and the worst case roughly doubles too — this is **O(n)**: cost grows in direct, linear proportion to the size of the data. This is exactly the cost `SELECT * FROM members WHERE username = ?` would pay *if `username` had no index* — a full scan, checking every row.

### Explain the mechanism

There's nothing wrong with this code — it's the only option available with no additional structure. The entire idea behind a hash map is trading a small amount of extra memory and setup work for turning that O(n) search into something close to constant time, regardless of how large the collection grows.

---

## Concept Unit: Hashing — Turning a Key Into a Location

### The Problem

If we could compute, directly from the string `"grace"`, exactly *where* to look — without checking anything else first — we'd skip the scan entirely. That's the core idea: a function that turns a key into an address.

### Demonstrate the behavior

Create `lab_hash_function.py`:

```python
def simple_hash(key: str, bucket_count: int) -> int:
    total = sum(ord(char) for char in key)
    return total % bucket_count

for name in ["ada", "grace", "bob"]:
    print(f"{name} -> bucket {simple_hash(name, 10)}")
```

Run it:

```bash
python lab_hash_function.py
```

Output:

```text
ada -> bucket 4
grace -> bucket 9
bob -> bucket 7
```

*What this proves:* `simple_hash` is **deterministic** — the same string always produces the same bucket number — and it computes that number directly from the string's contents, in one pass, without comparing it to any other string. That's the entire trick: instead of asking "is this the one I want?" repeatedly, you ask "where would this one live?" exactly once.

### Explain the mechanism, including where it breaks

This particular hash function is naive on purpose — `sum(ord(char))` ignores character *order* entirely, so `"ab"` and `"ba"` hash identically, and two completely different strings can easily land in the same bucket (a **collision**). Real hash functions (including the one Python's `dict` uses internally) are far more careful about avoiding collisions, but no hash function can eliminate them entirely — there are always more possible strings than there are buckets. A hash map has to handle collisions gracefully, not pretend they can't happen.

---

## Concept Unit: A Minimal Hash Map, With Collision Handling

### The Problem

Knowing a key's bucket isn't enough by itself — if two different keys land in the same bucket (a collision), we need a way to still distinguish and retrieve the right one.

### The New Code

Create `lab_hashmap.py`:

```python
class SimpleHashMap:
    def __init__(self, bucket_count=8):
        self.buckets = [[] for _ in range(bucket_count)]
        self.bucket_count = bucket_count

    def _hash(self, key):
        return sum(ord(c) for c in key) % self.bucket_count

    def insert(self, key, value):
        bucket = self.buckets[self._hash(key)]
        for i, (existing_key, _) in enumerate(bucket):
            if existing_key == key:
                bucket[i] = (key, value)  # overwrite existing
                return
        bucket.append((key, value))  # new key in this bucket

    def get(self, key):
        bucket = self.buckets[self._hash(key)]
        for existing_key, value in bucket:
            if existing_key == key:
                return value
        raise KeyError(key)

m = SimpleHashMap()
m.insert("ada", "mathematician")
m.insert("grace", "rear admiral")
m.insert("bob", "unrelated")

print(m.get("grace"))
print(m.buckets)
```

Run it:

```bash
python lab_hashmap.py
```

Output:

```text
rear admiral
[[], [], [], [], [('ada', 'mathematician')], [], [], [('bob', 'unrelated')], [], [('grace', 'rear admiral')]]
```

### Mechanical walkthrough

1. `self.buckets = [[] for _ in range(bucket_count)]`: (first appearance). A fixed number of empty lists — this is the actual memory allocation of the hash map, sized in advance.
2. `_hash(key)`: (already-established from the isolation example) — determines which of the `bucket_count` lists a key belongs in.
3. `for i, (existing_key, _) in enumerate(bucket): if existing_key == key:`: (first appearance of **chaining**). Each bucket is itself a small list, holding every key that ever hashed to that bucket. Looking something up means: hash once to find the *right bucket* (fast, O(1)), then linear-search *within just that bucket* (usually very short) to handle any collisions.
4. `get("grace")`: hashes to bucket 9 (from the earlier isolation example), finds exactly one entry there, returns its value — no comparison against `"ada"` or `"bob"` ever happens, because they hashed to entirely different buckets.

### CS Lens

**Why this is O(1) on average, not worst case.** If keys are spread evenly across buckets, each bucket holds roughly `n / bucket_count` items — a small, roughly constant number regardless of how large `n` gets, *as long as `bucket_count` grows along with the data* (real hash map implementations, including Python's `dict`, automatically resize their bucket array as items are added, to maintain this). The worst case — every key colliding into one bucket — degrades to the O(n) linear search from the first unit; this is why hash function quality matters, and why `simple_hash` above, with its order-blind, easily-collided design, would perform poorly on real-world, adversarial, or unlucky data.

### SE Lens

**This is what Python's `dict` and `set` actually are.** Every `some_dict[key]` lookup you've ever written, since your very first Python course, was doing exactly this — hash the key, find the bucket, resolve any collision — just implemented in highly optimized C rather than the ~15 lines above. You've been using this data structure correctly for years without a mental model of why it was fast; now you have one.

---

## Correcting an Earlier Simplification

Lesson 3's CS Lens described a primary-key lookup as **"similar in spirit"** to a hash map, in that both avoid scanning every row. That phrase was deliberately loose, and it's worth being precise now that you've built one: SQLite's primary key index is actually a **B-tree**, not a hash table — it achieves roughly O(log n) lookups (each step eliminates about half the remaining rows, similar to Interlude C's bisection idea) rather than a hash map's O(1) average. Both are dramatically better than the O(n) full scan from this interlude's first unit, and both were fair to call "not a linear search" — but they're genuinely different structures, achieving similar-magnitude speedups through different mechanisms, and conflating them would be a real gap, not a harmless simplification.

---

## Closing

**Connect the pieces**
A linear scan costs O(n). A hash map trades memory and a hashing step for average O(1) lookups, by turning "search for this" into "compute exactly where this lives." Python's `dict`, which you've used since your very first course, is this exact structure. SQLite's indexes achieve a similar practical speedup through a different mechanism — a B-tree, O(log n) — which Lesson 12's `EXPLAIN QUERY PLAN` will let you observe directly.

**What breaks without this**
Using a bad hash function (like `simple_hash`'s order-blind design) on real data can silently degrade a hash map's performance from O(1) toward O(n), with no error, no warning — just a program that mysteriously gets slower as it grows, for a reason invisible unless you understand what's supposed to be happening underneath.

**Exercises**
1. Modify `simple_hash` to actually use character *position*, not just character values (e.g. `ord(c) * (i + 1)`), and confirm `"ab"` and `"ba"` now hash differently.
2. Insert 20 short, similar keys (e.g. `"key0"` through `"key19"`) into a `SimpleHashMap` with only 4 buckets, print `self.buckets`, and observe how unevenly they distribute — this is what "the hash function matters" looks like concretely.

**Definition of Done**
* [x] Demonstrated O(n) linear search's cost with `lab_linear.py`.
* [x] Built a hash function and observed collisions with `lab_hash_function.py`.
* [x] Built a working hash map with chaining, from scratch, with `lab_hashmap.py`.
* [x] Can explain, without notes, why Lesson 3's "primary key lookups are fast" and this interlude's "hash maps are fast" are related but not identical claims.

---

## Context Snapshot (End of Interlude B)

**1-5, 7-8.** Unchanged from end of Lesson 9 — no application files touched.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| O(n) / linear search | Interlude B | Cost grows directly in proportion to data size |
| Hash function | Interlude B | Deterministically computes a location from a key, without comparison |
| Collision | Interlude B | Two different keys hashing to the same location |
| Chaining | Interlude B | Handling collisions by storing multiple entries per bucket, searched linearly within just that bucket |
| O(1) average case | Interlude B | Roughly constant-time lookup, assuming a reasonably even hash distribution |
| B-tree (index) | Interlude B | The structure behind SQLite's primary-key/indexed lookups — O(log n), distinct from a hash map's O(1) |

**7. Lesson Completion State:**
- Completed: Lessons 1-9, Interludes A, B, C
- Next: Lesson 10 — Searching for People (query params, `LIKE`, indexes, debouncing)
