# FOUNDATIONS — LAB-025 — Hash Tables: O(1) Lookup

**Series:** FOUNDATIONS — Part V: Data Structures
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 60–75 minutes.

---

## What You Will Build

A simplified hash table implementation — a class with a hash function, a bucket array, and chaining for collision resolution — that demonstrates O(1) average-case insert and lookup. You will time it against linear array search to confirm the performance difference, trigger a collision, and see why worst-case hash table lookup is O(n). After this lab, you will know why JavaScript objects and Maps have O(1) property access, what a hash function does, and when worst-case hash table performance matters.

---

## What You Need to Know First

**From LAB-024 (Arrays):** O(1) array access by index. O(n) array search by value. Hash tables turn value search into index access by converting the value to an index using a hash function.

**From LAB-005 (Big-O):** Average case vs worst case. An algorithm can be O(1) average and O(n) worst — hash tables are the canonical example.

---

> **Quick Check — try to answer before reading:**
>
> 1. How does a hash table convert `"username"` (a string key) into an array index?
> 2. Two keys hash to the same index. How does the hash table handle this without losing one of them?
> 3. JavaScript `{}` object property access (`obj.key`) is described as O(1). What data structure does it use internally?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Problem Array Lookup Solves and Its Remaining Limitation

**The problem this step solves:** Establish what arrays can and cannot do efficiently, motivating the hash table.

**The code:**

```js
// The limitation of arrays for lookup-by-value:
const users = [
  { id: 1, username: "alice", email: "alice@example.com" },
  { id: 2, username: "bob",   email: "bob@example.com" },
  { id: 3, username: "carol", email: "carol@example.com" },
  // ... imagine 1,000,000 users
];

// O(n) — must scan every element:
function findByUsername(users, username) {
  return users.find(user => user.username === username);
}

console.time("linear search");
findByUsername(users, "carol");
console.timeEnd("linear search");

// Can we do better? Only if we can convert "carol" to an index directly.
```

**The walkthrough:**

`users.find(user => user.username === username)` checks each user in order. For "carol" at index 2 in a 3-element array, it checks users[0] ("alice"), users[1] ("bob"), users[2] ("carol") — 3 comparisons. For a million-user array where "carol" is last: a million comparisons. O(n).

**The insight:** If we could convert `"carol"` to the number `2` (its index), we could access it in O(1). A **hash function** does exactly this — it converts a key to an array index.

**CS lens — the hash table idea:**

A hash table is an array (for O(1) access) combined with a hash function (to convert keys to indices). Instead of searching for a value by scanning, we compute where it should be. If our hash function maps `"alice"` to `0`, `"bob"` to `1`, and `"carol"` to `2`, then `table["carol"]` computes index `2` and accesses `table[2]` directly — O(1).

**SE lens — the cost of O(n) search at scale:**

Searching an unsorted array of 1 million users by username: each search costs up to 1,000,000 comparisons. A login system handling 1,000 requests/second calls this 1,000 times per second. That is up to 1,000,000,000 comparisons per second just for user lookups. A hash table reduces this to approximately 1,000 comparisons per second. The performance difference is not academic — it is the difference between a usable system and a crashed server.

---

### SAVE AND TRY

```js
// Build an index from username to user object (a manual hash table):
const userArray = [
  { id: 1, username: "alice", email: "alice@example.com" },
  { id: 2, username: "bob",   email: "bob@example.com" },
  { id: 3, username: "carol", email: "carol@example.com" },
];

const userIndex = {};
for (const user of userArray) {
  userIndex[user.username] = user;
}

// O(1) lookup by username:
console.log(userIndex["alice"]);  // → { id: 1, username: "alice", ... }
console.log(userIndex["carol"]);  // → { id: 3, ... }
console.log(userIndex["dave"]);   // → undefined
```

Expected: the alice and carol objects; `undefined` for dave.

**This is a hash table** — JavaScript's `{}` object IS a hash table. Property access (`obj.key` or `obj[key]`) is O(1) because the engine uses a hash function internally to map string keys to storage locations.

**Change something:** Time `userIndex["carol"]` vs `userArray.find(u => u.username === "carol")` with 10,000 users. Build `userIndex` with `Array.from({length:10000}, (_,i) => ({id:i, username:`user${i}`}))`. Time both. Expected: index lookup is dramatically faster.

---

### Step 2 — Implementing a Hash Function

**The problem this step solves:** Show what a hash function does mechanically.

**The code:**

```js
class HashTable {
  constructor(bucketCount = 53) {
    this.buckets = new Array(bucketCount).fill(null).map(() => []);
    this.bucketCount = bucketCount;
  }

  #hash(key) {
    let hash = 0;
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      const charCode = key.charCodeAt(i);
      hash = (hash * 31 + charCode) % this.bucketCount;
    }
    return hash;
  }

  set(key, value) {
    const index = this.#hash(key);
    const bucket = this.buckets[index];
    const existingPair = bucket.find(pair => pair[0] === key);
    if (existingPair) {
      existingPair[1] = value;   // update existing
    } else {
      bucket.push([key, value]); // new entry
    }
    return this;
  }

  get(key) {
    const index = this.#hash(key);
    const bucket = this.buckets[index];
    const pair = bucket.find(pair => pair[0] === key);
    return pair ? pair[1] : undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }
}
```

**`key.charCodeAt(i)`** — returns the UTF-16 character code of the character at index `i`. `"A".charCodeAt(0)` is `65`. `"a".charCodeAt(0)` is `97`. Used to convert a string to a sequence of numbers that the hash function can process.

**`(hash * 31 + charCode) % this.bucketCount`** — the hash function. Multiplying by a prime (`31`) reduces clustering and spreads keys evenly across buckets. The modulo (`%`) ensures the result stays within `[0, bucketCount - 1]` — a valid array index.

**Why `bucketCount = 53` (a prime)?** Prime numbers reduce the chance of systematic collisions. When the number of buckets is prime, certain patterns in key values that would cluster badly with non-prime sizes are spread more evenly.

**The walkthrough — `hashTable.set("alice", { id: 1 })`:**

1. `this.#hash("alice")` — iterates through 'a', 'l', 'i', 'c', 'e'. Applies `hash = (hash * 31 + charCode) % 53` for each character. Returns some index in `[0, 52]`, e.g., `14`.
2. `bucket = this.buckets[14]` — retrieves the array at index 14 (initially `[]`).
3. `bucket.find(...)` — no existing pair with key `"alice"`. Returns `undefined`.
4. `bucket.push(["alice", { id: 1 }])` — stores a key-value pair in the bucket.

**CS lens — chaining for collision resolution:**

When two keys hash to the same index, they share a bucket. Each bucket is an array (a "chain") of key-value pairs. This is called **separate chaining**. If `"alice"` and `"frank"` both hash to `14`, `buckets[14]` becomes `[["alice", ...], ["frank", ...]]`. Looking up `"frank"` finds the bucket at index 14, then scans the chain for the pair with key `"frank"`.

**SE lens — the load factor:**

If many keys hash to the same bucket, the chain grows long and lookup degrades toward O(n). The **load factor** is `n / bucketCount` (number of entries divided by number of buckets). When the load factor exceeds ~0.7, most implementations resize (double the bucket count and rehash all entries). JavaScript's built-in Map and object maintain a good load factor automatically.

**What breaks with a bad hash function:**

A hash function that always returns `0` maps every key to `buckets[0]`. Every lookup searches the entire chain: O(n). A good hash function distributes keys uniformly. `31` and prime bucket counts are standard engineering choices that produce good distribution for string keys.

---

### SAVE AND TRY

```js
const table = new HashTable();

table.set("alice", { id: 1, email: "alice@example.com" });
table.set("bob",   { id: 2, email: "bob@example.com" });
table.set("carol", { id: 3, email: "carol@example.com" });

console.log(table.get("alice"));   // → { id: 1, email: "alice@example.com" }
console.log(table.get("carol"));   // → { id: 3, ... }
console.log(table.get("dave"));    // → undefined
console.log(table.has("bob"));     // → true
console.log(table.has("dave"));    // → false
```

Expected: alice and carol objects, `undefined`, `true`, `false`.

**Change something:** Update an existing key: `table.set("alice", { id: 1, email: "new@email.com" })`. Call `table.get("alice")`. Expected: updated email. The `set` method updates existing pairs rather than creating duplicates.

---

### Step 3 — Collisions and Worst-Case O(n)

**The problem this step solves:** Show that collisions degrade performance and that O(n) worst case is real.

**The code:**

```js
// Inspect the bucket distribution:
class DiagnosticHashTable extends HashTable {
  getBucketLengths() {
    return this.buckets.map(bucket => bucket.length);
  }

  getLongestChain() {
    return Math.max(...this.buckets.map(b => b.length));
  }

  getLoadFactor() {
    const total = this.buckets.reduce((sum, b) => sum + b.length, 0);
    return total / this.bucketCount;
  }
}

const diagnosticTable = new DiagnosticHashTable(10);   // small bucket count to force collisions

const words = ["apple", "banana", "cherry", "date", "elderberry",
               "fig", "grape", "honeydew", "kiwi", "lemon"];

words.forEach(word => diagnosticTable.set(word, word.length));

console.log("Bucket lengths:", diagnosticTable.getBucketLengths());
console.log("Longest chain:", diagnosticTable.getLongestChain());
console.log("Load factor:", diagnosticTable.getLoadFactor().toFixed(2));
```

**The walkthrough:**

With 10 buckets and 10 keys, average 1 key per bucket. But the hash function does not guarantee uniform distribution — some buckets may have 2 or 3 keys, others 0. The `getLongestChain()` shows the worst-case lookup cost: if a bucket has 3 pairs, finding a key in that bucket requires checking 3 pairs (O(3) = O(1) for small chains, but could be O(n) in pathological cases).

**Demonstrating the worst case — an adversarial key set:**

```js
// Create keys that all hash to the same bucket (bucket 0 in this example)
// By choosing keys whose hash function produces 0:
const adversarialTable = new DiagnosticHashTable(53);

// Normal usage (distributed):
["a","b","c","d","e"].forEach(k => adversarialTable.set(k, k));
console.log("Normal: longest chain =", adversarialTable.getLongestChain());

// Adversarial usage (all to same bucket):
// An attacker who knows the hash function can craft keys that all hash to the same bucket
// This is called a hash collision attack (relevant for security — see LAB-099)
```

**CS lens — collision attacks:**

In 2011, researchers demonstrated that web servers using hash tables for HTTP headers were vulnerable to **hash collision denial-of-service attacks**: an attacker could send HTTP requests with headers crafted to all hash to the same bucket, forcing O(n²) processing. This led to JavaScript engines randomizing their hash functions with a per-execution secret, so attackers cannot predict which keys collide. Node.js and V8 include this protection (`--hash-seed`).

**SE lens — why you use Map instead of implementing your own:**

JavaScript's `Map` uses a hash table internally with a well-tuned hash function, dynamic resizing, and security protections. Writing your own hash table is for learning. In production: use `{}` for string keys or `Map` for any key type. JavaScript's implementations are correct, fast, and secure — hand-rolled ones are slower to write and more likely to have collision issues.

**What breaks with a poor load factor:**

A hash table with 100 keys and 10 buckets has a load factor of 10. Average bucket length is 10. Average lookup scans 5 pairs (halfway through a chain). The O(1) claim requires the load factor to be bounded. An unbounded hash table with no resizing degrades linearly.

---

### SAVE AND TRY

```js
// JavaScript's Map — the production hash table:
const map = new Map();

map.set("alice", { id: 1, score: 95 });
map.set("bob",   { id: 2, score: 87 });
map.set("carol", { id: 3, score: 92 });

console.log(map.get("alice"));    // → { id: 1, score: 95 }
console.log(map.has("dave"));     // → false
console.log(map.size);            // → 3

// Map can use any value as a key — not just strings:
const objectKey = { type: "admin" };
map.set(objectKey, "special value");
console.log(map.get(objectKey));  // → "special value"
```

`Map` vs plain object `{}` for hash tables:
- `Map`: any key type, guaranteed O(1), preserves insertion order, has `.size`, no prototype pollution
- `{}`: string/Symbol keys only, O(1) for most cases, may inherit prototype properties

Expected: alice's record, `false`, `3`, `"special value"`.

**Change something:** Delete a key: `map.delete("bob")`. Check `map.has("bob")`. Expected: `false`. Iterate: `for (const [key, value] of map) console.log(key, value.score)`. Expected: alice (95), carol (92) — bob was deleted; insertion order is preserved.

---

## Connect the Pieces

**What you built:** A hash table with chaining, a diagnostic version to inspect bucket distribution, and experience with JavaScript's built-in `Map`.

**How it connects to LAB-024 (Arrays):** A hash table IS an array — specifically, an array of buckets. The hash function converts keys to array indices, making the O(1) array access serve as O(1) key lookup. The O(n) worst case comes from O(n) linear search within an overfull bucket — the same O(n) from LAB-024.

**How it connects forward:**

- **LAB-026 (Sets):** A `Set` is a hash table that stores only keys (no values). O(1) membership testing uses the same hash function mechanism.
- **LAB-033 (Dynamic Programming):** Memoization caches results in a hash table: key = function arguments, value = result. O(1) lookup makes memoization effective.
- **LAB-113 (SQL Indexes):** A database B-tree index is conceptually similar — convert a column value to a storage location for O(log n) lookup rather than O(n) full table scan. Hash indexes achieve O(1) for exact-match queries.

**The real-world connection:**

Every programming language's standard library contains a hash table: Python's `dict`, Java's `HashMap`, C#'s `Dictionary<K,V>`, Go's `map`. Redis is essentially a persistent hash table over a network. HTTP cache headers use hash tables keyed by URL. DNS resolvers maintain hash tables of hostname → IP address. Hash tables are the most used non-array data structure in all of software.

---

## What Breaks Without This

**Concrete failure — O(n) lookup scales catastrophically:**

```js
// O(n) user lookup in a loop:
const users = Array.from({ length: 10_000 }, (_, i) => ({ id: i, username: `user${i}` }));

function getPermissions(requestedUsernames) {
  return requestedUsernames.map(username =>
    users.find(u => u.username === username)?.id  // O(n) inside O(m) loop = O(n×m)
  );
}

// This function is O(n×m) — for 1000 requested names and 10,000 users: 10,000,000 operations
// With a hash table: O(1) per lookup = O(m) total = 1,000 operations
```

---

## Definition of Done

Verify each item before moving to LAB-026.

- [ ] `HashTable.set("key", value)` and `HashTable.get("key")` work correctly
- [ ] Two keys in the same bucket (collision) — both retrievable without conflict
- [ ] `HashTable.get("missing")` returns `undefined`
- [ ] `Map.get(key)` works with object keys (not just strings)
- [ ] You can explain why O(1) average becomes O(n) worst case
- [ ] You can explain the load factor and its impact on performance

**Git commit:**

```
git add .
git commit -m "LAB-025: hash table implementation with chaining — O(1) average lookup, collision resolution, load factor analysis"
```

---

## Quick Check Answers

**1. How does a hash table convert `"username"` to an array index?**

A hash function processes the string character by character, combining character codes using arithmetic (e.g., `hash = hash * 31 + charCode`) to produce a number. The modulo operation (`% bucketCount`) maps the result to a valid index in `[0, bucketCount - 1]`. The same string always produces the same index — deterministic — and different strings spread across different indices.

**2. Two keys hash to the same index — how does the hash table handle this?**

The bucket at that index holds an array of key-value pairs (a "chain"). Both pairs are stored in the chain. Lookup checks the bucket index first (O(1)), then linearly scans the chain for the exact key match (O(chain length)). If chains are short (good hash function, reasonable load factor), this is effectively O(1). If chains are long (bad hash function or overloaded table), it degrades toward O(n).

**3. What data structure does JavaScript's `{}` use internally?**

A hash table. When you access `obj.username`, the JavaScript engine applies its internal hash function to the string `"username"`, finds the corresponding bucket, and retrieves the value. This is why property access is O(1) regardless of how many properties the object has. V8 (Chrome's engine) adds further optimizations like "hidden classes" to make repeated access to the same object shape even faster, but the fundamental mechanism is a hash table.

---

*Next: LAB-026 — Sets*
