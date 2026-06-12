# FOUNDATIONS — LAB-026 — Sets

**Series:** FOUNDATIONS — Part V: Data Structures
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 45–55 minutes.

---

## What You Will Build

Solutions to three classic problems — deduplication, membership testing, and set intersection — using JavaScript's built-in `Set`, with timing comparisons showing why `Set.has()` is O(1) while `Array.includes()` is O(n). After this lab, you will reach for `Set` immediately when you need to answer "have I seen this before?" or "what do these two collections have in common?"

---

## What You Need to Know First

**From LAB-025 (Hash Tables):** A Set is a hash table that stores only keys — no associated values. O(1) membership testing uses the same hash function mechanism as a hash table.

**From LAB-024 (Arrays):** `Array.includes()` is O(n) because it scans every element. `Set.has()` is O(1) because it uses a hash function to jump directly to the bucket.

---

> **Quick Check — try to answer before reading:**
>
> 1. You have an array with 10,000 elements, some repeated. How many operations does `Set` need to deduplicate it? How many does a nested-loop approach need?
> 2. What mathematical operations are defined on sets? Name three.
> 3. `Set` vs `Map` — when would you use each?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Creating Sets and O(1) Membership Testing

**The problem this step solves:** Establish the Set API and demonstrate the performance advantage over array search.

**The code:**

```js
const uniqueIds = new Set([1, 2, 3, 2, 1, 4, 3]);   // duplicates removed automatically
console.log(uniqueIds.size);          // → 4  (1, 2, 3, 4)
console.log(uniqueIds.has(3));        // → true   O(1)
console.log(uniqueIds.has(99));       // → false  O(1)

uniqueIds.add(5);
uniqueIds.delete(1);
console.log([...uniqueIds]);          // → [2, 3, 4, 5]  (insertion order preserved)
```

**`new Set(iterable)`** — creates a Set from any iterable (array, string, another Set). Duplicate values are silently discarded. A `Set` maintains **insertion order** — iterating over it yields values in the order they were first added.

**`set.has(value)`** — O(1) membership test. Applies the hash function to `value`, checks the corresponding bucket.

**`set.add(value)`** — O(1) amortized. Adds the value if not already present; no-op if present.

**`set.delete(value)`** — O(1). Removes the value if present; no-op if absent.

**`[...set]`** — spread a Set into an array, preserving insertion order.

**`set.size`** — the number of unique values (property, not method — no parentheses).

**The walkthrough — `new Set([1, 2, 3, 2, 1, 4, 3])`:**

Adds `1` — new, added. Adds `2` — new, added. Adds `3` — new, added. Adds `2` — already present, skipped. Adds `1` — already present, skipped. Adds `4` — new, added. Adds `3` — already present, skipped. Final Set: `{1, 2, 3, 4}`.

**CS lens — Set as hash table without values:**

A `Set` is a hash table where each entry is just a key — no associated value. The hash function maps each value to a bucket. Membership testing hashes the query value and checks if that bucket contains it. This is the same mechanism as `Map` from LAB-025, just without the value storage.

**SE lens — the right tool for "have I seen this?":**

The canonical Set use case: track which items have been processed. As you process each item, add it to the Set. Before processing, check `set.has(item)`. With an array: O(n) per check. With a Set: O(1). For 10,000 items with 10,000 checks: array is O(n²) = 100,000,000 operations; Set is O(n) = 10,000 operations.

**What breaks using Array for membership:**

```js
const processed = [];
for (const item of largeList) {
  if (!processed.includes(item)) {  // O(n) — scans entire 'processed' array
    process(item);
    processed.push(item);
  }
}
// Total: O(n²)

// Fix:
const processedSet = new Set();
for (const item of largeList) {
  if (!processedSet.has(item)) {    // O(1)
    process(item);
    processedSet.add(item);
  }
}
// Total: O(n)
```

---

### SAVE AND TRY

```js
const tagArray = ["js", "typescript", "js", "react", "typescript", "node", "js"];

// Deduplicate with Set:
const uniqueTags = new Set(tagArray);
console.log("Unique tags:", [...uniqueTags]);
console.log("Count:", uniqueTags.size);
```

Expected: `["js", "typescript", "react", "node"]`, count `4`.

**Change something:** Check membership speed for 100,000 items:

```js
const largeSet = new Set(Array.from({ length: 100_000 }, (_, i) => i));
const largeArr = [...largeSet];

console.time("Set.has (O(1))");
for (let i = 0; i < 10_000; i++) largeSet.has(99_999);
console.timeEnd("Set.has (O(1))");

console.time("Array.includes (O(n))");
for (let i = 0; i < 100; i++) largeArr.includes(99_999);
console.timeEnd("Array.includes (O(n))");
```

Expected: Set is dramatically faster even though the loop counts are reversed. The O(1) vs O(n) difference dominates.

---

### Step 2 — Set Operations: Union, Intersection, Difference

**The problem this step solves:** Implement the three fundamental set operations and show their applications.

**The code:**

```js
function union(setA, setB) {
  return new Set([...setA, ...setB]);
}

function intersection(setA, setB) {
  return new Set([...setA].filter(item => setB.has(item)));
}

function difference(setA, setB) {
  return new Set([...setA].filter(item => !setB.has(item)));
}

function isSubset(subset, superset) {
  return [...subset].every(item => superset.has(item));
}

const setA = new Set([1, 2, 3, 4, 5]);
const setB = new Set([3, 4, 5, 6, 7]);

console.log("Union:",        [...union(setA, setB)]);         // → [1,2,3,4,5,6,7]
console.log("Intersection:", [...intersection(setA, setB)]);  // → [3,4,5]
console.log("A minus B:",    [...difference(setA, setB)]);    // → [1,2]
console.log("B minus A:",    [...difference(setB, setA)]);    // → [6,7]
console.log("A ⊆ A∪B:",     isSubset(setA, union(setA, setB)));  // → true
```

**The walkthrough — `intersection(setA, setB)`:**

1. `[...setA]` — spreads `setA` into array `[1, 2, 3, 4, 5]`.
2. `.filter(item => setB.has(item))` — for each item, check if it is in `setB`. Only `3`, `4`, `5` pass.
3. `new Set([3, 4, 5])` — wraps in a Set (no duplicates possible here, but good practice).

**Time complexity:** `intersection` is O(n) where n = `setA.size`. Each `setB.has(item)` is O(1), so the filter is O(n). `union` is O(n + m). `difference` is O(n). All are optimal for set operations.

**CS lens — sets as the foundation of database queries:**

SQL `JOIN` is intersection. SQL `UNION` is set union. SQL `WHERE id NOT IN (...)` is difference. Every database query is ultimately a set operation. The set theory developed in mathematics in the 19th century maps directly to the relational algebra that underlies SQL, which maps to what you are computing here in JavaScript.

**SE lens — real-world applications:**

**User permissions:** `intersection(userPermissions, requiredPermissions).size === requiredPermissions.size` — does the user have all required permissions?

**Feature flags:** `difference(allFeatures, enabledFeatures)` — which features are disabled?

**Cache invalidation:** `intersection(changedKeys, cachedKeys)` — which cache entries need to be invalidated?

**Change detection:** `union(setA, setB).size > intersection(setA, setB).size` — are there any differences between two sets?

**What breaks with array-based set operations:**

Array-based intersection: `arrA.filter(item => arrB.includes(item))` — each `includes` is O(n), giving O(n²) total. For 1,000-element arrays: 1,000,000 operations. Set-based intersection: each `has` is O(1), giving O(n) total: 1,000 operations.

---

### SAVE AND TRY

```js
// Practical example: finding common interests for friend recommendations
const aliceInterests = new Set(["hiking", "cooking", "photography", "travel"]);
const bobInterests   = new Set(["cooking", "gaming", "photography", "music"]);
const carolInterests = new Set(["travel", "photography", "cycling", "cooking"]);

function commonWith(person, other) {
  return intersection(person, other);
}

console.log("Alice & Bob common:",   [...commonWith(aliceInterests, bobInterests)]);
console.log("Alice & Carol common:", [...commonWith(aliceInterests, carolInterests)]);
console.log("All three common:",     [...intersection(intersection(aliceInterests, bobInterests), carolInterests)]);
```

Expected: shared interests between pairs and across all three.

**Change something:** Find interests unique to Alice (not shared with anyone): `[...difference(aliceInterests, union(bobInterests, carolInterests))]`. Expected: only interests Alice has that neither Bob nor Carol share.

---

### Step 3 — Deduplication and Counting Unique Values

**The problem this step solves:** The two most common practical uses of Sets in real code.

**The code:**

```js
// Deduplication (preserves order):
const events = [
  "pageview", "click", "pageview", "scroll",
  "click", "pageview", "submit", "click"
];

const uniqueEvents = [...new Set(events)];
console.log(uniqueEvents);  // → ["pageview", "click", "scroll", "submit"]
console.log("Unique count:", new Set(events).size);  // → 4

// Counting unique values without deduplicating:
const words = "the cat sat on the mat the cat".split(" ");
const uniqueWordCount = new Set(words).size;
console.log("Unique words:", uniqueWordCount);  // → 5 (the, cat, sat, on, mat)

// Check if an array has duplicates:
function hasDuplicates(arr) {
  return arr.length !== new Set(arr).size;
}

console.log(hasDuplicates([1, 2, 3, 4]));    // → false
console.log(hasDuplicates([1, 2, 2, 4]));    // → true
```

**`string.split(delimiter)`** — splits a string into an array at each occurrence of `delimiter`. `"a b c".split(" ")` returns `["a", "b", "c"]`. Returns `["abc"]` if the delimiter is not found.

**The walkthrough — `hasDuplicates([1, 2, 2, 4])`:**

`new Set([1, 2, 2, 4])` produces `{1, 2, 4}` — size `3`. Original array length is `4`. `4 !== 3` → `true` — has duplicates. O(n) total (Set construction is O(n), size check is O(1)).

**CS lens — bijection between array and set:**

An array has duplicates if and only if its length exceeds its set's size. This works because the Set removes all duplicates while preserving unique values. The size difference is exactly the count of "extra" occurrences. A Set is the data structure that enforces uniqueness by construction.

**SE lens — deduplication in data pipelines:**

Deduplication is one of the most common data processing tasks: event tracking logs duplicate pageviews, database joins produce duplicate rows, API responses include duplicate IDs. `[...new Set(array)]` is the idiomatic O(n) one-liner. Alternative approaches — `array.filter((item, index, arr) => arr.indexOf(item) === index)` — are O(n²) and should be avoided.

**What breaks using indexOf for deduplication:**

`array.filter((item, index) => array.indexOf(item) === index)` keeps only the first occurrence of each value by checking if the current index matches the first occurrence index. But `indexOf` is O(n), called for each of the n elements: O(n²). For 10,000 items: 100,000,000 operations. `new Set` does it in O(n).

---

### SAVE AND TRY

```js
// Track unique visitors to a page:
const visitorLog = [
  "alice", "bob", "alice", "carol", "bob",
  "alice", "dave", "carol", "alice"
];

const uniqueVisitors = new Set(visitorLog);
console.log("Unique visitors:", uniqueVisitors.size);   // → 4
console.log("Alice visited:", visitorLog.filter(v => v === "alice").length, "times");

// Find IDs mentioned in both a blacklist and a request batch:
const blacklist = new Set(["user-123", "user-456", "user-789"]);
const requestBatch = ["user-001", "user-123", "user-456", "user-900"];

const blockedRequests = requestBatch.filter(id => blacklist.has(id));
console.log("Blocked:", blockedRequests);   // → ["user-123", "user-456"]
```

Expected: `4` unique visitors, alice visited 4 times, two blocked requests.

**Change something:** Time the blacklist check with 100,000 items in the batch and 50,000 in the blacklist. Compare `Set.has` vs `Array.includes` for the membership test. Expected: O(1) vs O(n) — dramatic speed difference.

---

## Connect the Pieces

**What you built:** O(1) membership testing, union/intersection/difference operations, deduplication in O(n), and real-world applications.

**How it connects to LAB-025 (Hash Tables):** A `Set` is a `Map` without values. The hash function, bucket array, and O(1) guarantee are identical. The only difference is that `Set` stores each value once and provides membership testing; `Map` stores key-value pairs and provides retrieval.

**How it connects forward:**

- **LAB-027 (Stacks and Queues):** Sets model unordered unique collections; stacks and queues model ordered collections with access restrictions.
- **LAB-113 (SQL):** `DISTINCT` in SQL is the relational equivalent of `new Set()`. SQL `INNER JOIN` conditions are intersection constraints.
- **LAB-122 (Caching):** A `Set` of cached keys allows O(1) cache hit detection.

**The real-world connection:**

Compilers use Sets to track which variables are in scope. Routers use Sets to track visited nodes during graph traversal. Spell checkers load a dictionary into a Set and test each word with `set.has()`. Networking protocols use Sets to track which packets have been acknowledged. Any system that asks "is this item in a known collection?" benefits from O(1) Set membership.

---

## What Breaks Without This

**Concrete failure — O(n²) unique-ID generation:**

```js
const generatedIds = [];
function generateUniqueId() {
  let id;
  do {
    id = Math.floor(Math.random() * 1_000_000).toString();
  } while (generatedIds.includes(id));  // O(n) per check!
  generatedIds.push(id);
  return id;
}
// Generating 10,000 IDs: 10,000 × average 5,000 checks = 50,000,000 operations

// Fix: use a Set
const usedIds = new Set();
function generateUniqueIdFast() {
  let id;
  do {
    id = Math.floor(Math.random() * 1_000_000).toString();
  } while (usedIds.has(id));  // O(1)
  usedIds.add(id);
  return id;
}
// Generating 10,000 IDs: 10,000 × O(1) = 10,000 operations
```

---

## Definition of Done

Verify each item before moving to LAB-027.

- [ ] `new Set([1,2,2,3])` has size `3` and `has(2)` returns `true`
- [ ] `union`, `intersection`, `difference` produce correct results
- [ ] `hasDuplicates([1,2,2])` returns `true`; `hasDuplicates([1,2,3])` returns `false`
- [ ] `Set.has` is measurably faster than `Array.includes` for large collections
- [ ] The blocked-requests filter correctly identifies items in the blacklist

**Git commit:**

```
git add .
git commit -m "LAB-026: Set — O(1) membership, deduplication in O(n), union/intersection/difference for permission and cache logic"
```

---

## Quick Check Answers

**1. Operations for Set deduplication?**

`new Set(array)` — O(n): each of the n elements is inserted into the Set. Each insertion is O(1). The Set discards duplicates automatically. Converting back to array with `[...set]` is O(k) where k is the count of unique values. Total: O(n). A nested-loop approach (`for each item, scan rest of array for duplicates`) is O(n²).

**2. Three mathematical set operations:**

Union (`A ∪ B`): all elements in A or B or both. Intersection (`A ∩ B`): elements in both A and B. Difference (`A \ B`): elements in A but not in B. Others: Symmetric difference (`(A \ B) ∪ (B \ A)`), Subset check (`A ⊆ B`), Cartesian product.

**3. `Set` vs `Map` — when to use each?**

Use `Set` when you only care about **whether a value exists** — deduplication, membership testing, tracking "seen" items. Use `Map` when you need to **associate a value with a key** — caching (key = input, value = result), counting (key = item, value = count), indexing (key = id, value = object). `Set` is `Map` where the value is irrelevant.

---

*Next: LAB-027 — Stacks and Queues*
