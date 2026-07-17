---
concept: 071-hashing
name: Hashing / Hash Tables
---

## Definition

Hashing is converting a value (a key) into a number — its hash — using a
hash function, then using that number to compute exactly where in an array
to store or look up the associated data. This is the mechanism most
Map/Dictionary implementations use underneath.

## Problem

A plain array only supports O(1) access by numeric index — looking
something up by an arbitrary key (a string, an object) otherwise requires
scanning every entry, O(n), unless there's a way to convert that key
directly into an index. Hashing provides exactly that conversion, restoring
O(1) average-case lookup for arbitrary keys.

## Execution

hash("apple") → sum of character codes → 530
↓
bucket index = 530 % tableSize(8) → 2
↓
store "apple" → bucket[2]
↓
hash("banana") → 609 → bucket index = 609 % 8 → 1
↓
store "banana" → bucket[1]
↓
Collision: hash("mango") → 530 → bucket index = 530 % 8 → 2 (same bucket as "apple"!)
↓
Chaining: bucket[2] now holds a small list [("apple", val), ("mango", val)] instead of one entry
↓
Looking up "mango": hash to bucket 2, then scan the short chain there for the matching key

## Computer Science

A hash function is deterministic (the same key always produces the same
hash) but not necessarily unique — two different keys CAN produce the same
bucket index, called a **collision**, and every hash table implementation
needs a defined strategy for it (chaining: each bucket holds a small list of
entries; open addressing: probe to a different bucket instead). **Load
factor** (entries stored ÷ number of buckets) governs how often collisions
happen — as it climbs, lookups degrade from O(1) average toward O(n) worst
case, which is why hash tables automatically resize (rehash into a bigger
table) once load factor crosses a threshold.

Tags: Hash function, Collisions, Chaining, Load factor, Rehashing

## Software Engineering

This is what actually powers a Map/Dictionary's near-O(1) average-case
lookup — understanding hashing explains WHY that's only "average case," not
guaranteed: a poorly-distributed hash function, or an adversarially-chosen
set of keys, can force many collisions, degrading real-world performance
even though the theoretical average holds for well-behaved inputs.

Tags: Map/Dictionary, Average-case complexity, Hash function design, Caching

## Common Mistakes

- Assuming hash table lookup is always O(1) — it's O(1) *average case*, given a reasonably distributed hash function and load factor; a bad hash function that clusters many keys into the same bucket degrades toward O(n).
- Using a mutable object as a dictionary/hash-map key and then mutating it after inserting — the object's hash can change, making it unfindable at its original bucket even though it's still technically "in" the table.

## Exercises

- Compute `hash(key) % tableSize` by hand for a few string keys against a table of size 8, using the sum-of-character-codes hash function below — find two keys that land in the same bucket.
- Look up how your language's built-in Map/Dictionary handles collisions internally (chaining, or open addressing) and compare it against what's described here.

## javascript

```javascript
function simpleHash(key, tableSize) {
  let hash = 0
  for (const char of key) hash += char.charCodeAt(0)
  return hash % tableSize
}

class HashTable {
  #buckets
  constructor(size = 8) { this.#buckets = Array.from({ length: size }, () => []) }
  set(key, value) {
    const index = simpleHash(key, this.#buckets.length)
    const bucket = this.#buckets[index]
    const existing = bucket.find(entry => entry[0] === key)
    if (existing) existing[1] = value
    else bucket.push([key, value])
  }
  get(key) {
    const index = simpleHash(key, this.#buckets.length)
    const entry = this.#buckets[index].find(entry => entry[0] === key)
    return entry ? entry[1] : undefined
  }
}

const table = new HashTable()
table.set('apple', 1)
table.set('banana', 2)
console.log(table.get('apple'))    // 1
console.log(table.get('banana'))   // 2
console.log(table.get('cherry'))   // undefined — never inserted
```
Walkthrough: `simpleHash` converts a string key into a number by summing its
character codes, then reduces that to a valid bucket index with
`% tableSize`. Each bucket is itself a small array (this is chaining), so
two keys that hash to the same index can still both be stored — `get` hashes
the key to find the right bucket, then scans that (usually very short)
bucket's entries for the matching key.

## python

```python
def simple_hash(key, table_size):
    return sum(ord(c) for c in key) % table_size


class HashTable:
    def __init__(self, size=8):
        self._buckets = [[] for _ in range(size)]

    def set(self, key, value):
        index = simple_hash(key, len(self._buckets))
        bucket = self._buckets[index]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))

    def get(self, key):
        index = simple_hash(key, len(self._buckets))
        for k, v in self._buckets[index]:
            if k == key:
                return v
        return None


table = HashTable()
table.set('apple', 1)
table.set('banana', 2)
print(table.get('apple'))     # 1
print(table.get('banana'))    # 2
print(table.get('cherry'))    # None -- never inserted
```
Walkthrough: identical hash-then-bucket-then-chain mechanism as the
JavaScript version — Python's own built-in `dict` uses a real hash table
internally (with a far more sophisticated hash function and collision
strategy), but this is the same underlying idea, made visible.
