# CPP DSA — LAB-14 — Hash Tables From Scratch

**Prerequisites:** LAB-13 (Binary Search Trees)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What does a hash function actually do — what goes in, and what comes out?
2. Why can two completely different keys ever produce the same hash — isn't that a bug in the hash function?
3. What is "load factor," and why does it trigger a resize before the table is technically 100% full?

## What You Will Build

`MyHashMap<K, V>` — a hash table with separate chaining (each bucket is a `MyLinkedList`, LAB-07) for collision handling, a hash function you write and can watch distribute keys across buckets, and automatic resizing once load factor crosses a threshold — the structure that gives average O(1) lookup regardless of insertion order, directly solving LAB-13's "sorted data breaks a BST" problem.

```
$ ./hashmap_demo
Bucket count: 8
insert("alice", 90)  -> hash("alice") % 8 = 3
insert("bob", 85)    -> hash("bob") % 8 = 3    <- COLLISION with "alice"! chained.
insert("carol", 95)  -> hash("carol") % 8 = 6

Bucket 3: [alice:90] -> [bob:85] -> nullptr
Bucket 6: [carol:95] -> nullptr

get("bob") = 85
Load factor after 6 more inserts: 0.875 -- RESIZING to 16 buckets, rehashing everything
```

## Concept: Hashing — Turning a Key Into an Array Index

**What it is:** A hash table is, underneath, just an array (LAB-06's `MyVector`, conceptually) of "buckets," plus a **hash function** that converts any key (a string, an integer, anything) into an integer, which is then reduced with `% bucketCount` into a valid array index. Insert, lookup, and delete all follow the same first step: hash the key, find the bucket, then work within that one bucket — turning "search the whole structure" into "compute one number, then search one small bucket," which is what makes average-case O(1) possible.

**The problem before:** LAB-13's BST gives O(log n) search *if balanced* — but degrades to O(n) if data arrives in a bad order, a real, common risk LAB-13 demonstrated directly. A hash table sidesteps ordering entirely: because the bucket a key lands in is determined by the hash function, not by the order keys were inserted, there's no equivalent "sorted input degrades performance" trap — `insert("a")` then `insert("b")` behaves identically, performance-wise, to inserting them in the opposite order.

**The solution:** Write a hash function that spreads keys roughly evenly across buckets (Step 1), handle the inevitable **collisions** — two different keys hashing to the *same* bucket index — by chaining multiple key/value pairs together within one bucket using LAB-07's `MyLinkedList` (Step 2), and monitor **load factor** (`elementCount / bucketCount`) to trigger a resize (Step 4) before too many collisions pile up in individual buckets and degrade lookups back toward O(n) — the hash-table-specific version of the exact same "watch a proxy metric before it becomes a real problem" instinct.

**Canonical example:**

```cpp
int hashString(const std::string& key, int bucketCount) {
    unsigned long hash = 5381; // a real, simple, well-tested string hash: djb2
    for (char c : key) {
        hash = ((hash << 5) + hash) + c; // hash * 33 + c
    }
    return hash % bucketCount;
}
```

**Project Application:** LAB-19's file-backed database indexes every record loaded from disk into a `MyHashMap<std::string, Record>`, keyed by whatever field the file's records should be searchable by — the exact "open a file, read records, search them in memory" project the user's coursework touched on, built on top of this lab's structure directly.

**Watch for:** A hash function that hashes every key to the *same* bucket (a degenerate hash function, or accidentally always `return 0;`). This compiles and even produces correct results — every lookup still finds the right key eventually — but every single operation degrades to O(n), since every key ends up chained together in one single bucket, which is a hash table in name only; this is the hash-table-specific version of LAB-13's unbalanced-BST danger.

## Step 1: A hash function — the djb2 algorithm, and why `%` reduces it to a valid index

```cpp
// MyHashMap.h
#ifndef MY_HASH_MAP_H
#define MY_HASH_MAP_H

#include <string>

int hashString(const std::string& key, int bucketCount) {
    unsigned long hash = 5381;
    for (char c : key) {
        hash = ((hash << 5) + hash) + static_cast<unsigned long>(c); // hash * 33 + c
    }
    return static_cast<int>(hash % bucketCount);
}
```

`hash` accumulates into a huge number (an `unsigned long`, deliberately, to avoid overflow issues corrupting the distribution) — `(hash << 5) + hash` is a fast way to compute `hash * 33` (bit-shifting left by 5 is multiplying by 32, plus the original `hash` makes 33), and adding each character's numeric value mixes it into the running total. `djb2` is a real, widely-used, well-tested string hash — not something invented for this lesson — chosen specifically because it distributes typical string keys well in practice. The final `% bucketCount` is what turns a huge, essentially-arbitrary number into a valid array index between `0` and `bucketCount - 1` — this is the exact same modulo-wraparound idea LAB-10's circular buffer used, just applied to hash values instead of a sequential index.

### SAVE AND TRY

```cpp
std::cout << hashString("alice", 8) << "\n";
std::cout << hashString("bob", 8) << "\n";
std::cout << hashString("carol", 8) << "\n";
```

Run this and confirm you get three specific bucket indices — try a few more names, and notice (this is expected and fine) that some of them may land in the *same* bucket as each other purely by chance, which is precisely the collision scenario Step 2 handles.

## Step 2: Buckets as linked lists — handling collisions with chaining

```cpp
#include "MyLinkedList.h" // LAB-07

template<typename K, typename V>
struct KeyValuePair {
    K key;
    V value;
    KeyValuePair(K k, V v) : key(k), value(v) {}
};

template<typename K, typename V>
class MyHashMap {
private:
    MyVector<MyLinkedList<KeyValuePair<K, V>>> buckets; // an ARRAY of LINKED LISTS
    int elementCount;

public:
    MyHashMap(int initialBucketCount = 8) : elementCount(0) {
        for (int i = 0; i < initialBucketCount; i++) {
            buckets.push_back(MyLinkedList<KeyValuePair<K, V>>());
        }
    }
    // insert/get to follow in Step 3
};

#endif
```

`buckets` is `MyVector<MyLinkedList<...>>` — a dynamic array (LAB-06) *of* linked lists (LAB-07), a direct, concrete composition of two previously hand-built structures into a new one, exactly this series' promise that nothing built after LAB-05 needs to be re-explained from scratch. Each bucket starts as an *empty* `MyLinkedList`; when two keys collide (hash to the same bucket index), both of their `KeyValuePair`s simply end up chained together in that one bucket's list — `push_front`/`push_back` from LAB-07 handle adding to a bucket, no special "collision" code path needed at all, since a linked list already supports holding any number of elements.

### SAVE AND TRY

Construct a `MyHashMap<std::string, int>(8)` and confirm `buckets.getSize() == 8` immediately after construction, each one an empty `MyLinkedList` — before any `insert` call has happened, this is just eight empty chains, ready to receive whatever collides into them.

## Step 3: `insert` and `get` — hash, then search within one bucket

```cpp
template<typename K, typename V>
class MyHashMap {
    // ...continued from Step 2...
public:
    void insert(K key, V value) {
        int index = hashString(key, buckets.getSize());
        MyLinkedList<KeyValuePair<K, V>>& bucket = buckets[index];

        // check if the key already exists in this bucket -- if so, UPDATE instead of duplicating
        // (requires a way to walk MyLinkedList's nodes -- add a findByKey helper, or a public
        // head-access method to MyLinkedList for this purpose)

        bucket.push_front(KeyValuePair<K, V>(key, value));
        elementCount++;
    }

    bool get(K key, V& outValue) { // output parameter, LAB-10's Challenge pattern
        int index = hashString(key, buckets.getSize());
        MyLinkedList<KeyValuePair<K, V>>& bucket = buckets[index];

        // walk the bucket's chain looking for a matching key
        // (again requires exposing SOME way to iterate MyLinkedList's nodes --
        //  add a public method like forEach, or expose a head-node accessor for this class to use)

        return false; // placeholder -- see the full walking version below
    }
};
```

Both `insert` and `get` follow the identical two-step pattern the concept section named: hash the key to find *which* bucket (O(1), one function call), then work within that single bucket (searching its short chain, ideally O(1) on average if collisions stay rare). `buckets[index]` uses `MyVector`'s `operator[]` from LAB-06 — direct, familiar array indexing to jump straight to the right bucket.

### SAVE AND TRY

Trace through by hand, using Step 1's actual computed hash values: if `hashString("alice", 8)` and `hashString("bob", 8)` really do produce the same index (check your Step 1 output), predict what `buckets[thatIndex]`'s chain looks like after inserting both — write your prediction before finishing this class and testing it for real.

## Step 4: Load factor and resizing — before collisions pile up too far

```cpp
template<typename K, typename V>
class MyHashMap {
    // ...continued...
private:
    void resizeIfNeeded() {
        double loadFactor = static_cast<double>(elementCount) / buckets.getSize();
        if (loadFactor < 0.75) return; // still healthy, nothing to do

        int newBucketCount = buckets.getSize() * 2;
        MyVector<MyLinkedList<KeyValuePair<K, V>>> newBuckets;
        for (int i = 0; i < newBucketCount; i++) {
            newBuckets.push_back(MyLinkedList<KeyValuePair<K, V>>());
        }

        // walk EVERY existing bucket's EVERY existing pair, re-hashing each one
        // against the NEW bucket count (a key's bucket index depends on bucketCount,
        // so growing bucketCount means every single existing key's index must be recomputed)
        for (int i = 0; i < buckets.getSize(); i++) {
            // walk buckets[i]'s chain, and for each pair, compute its new index and
            // push it into newBuckets at that new index
        }

        buckets = newBuckets; // MyVector's copy assignment (LAB-06's Rule of Three) handles this correctly
    }

public:
    void insert(K key, V value) {
        resizeIfNeeded(); // check BEFORE inserting, so the new element is accounted for in the trigger
        int index = hashString(key, buckets.getSize());
        buckets[index].push_front(KeyValuePair<K, V>(key, value));
        elementCount++;
    }
};
```

Growing `bucketCount` means *every* existing key's bucket index potentially changes — `hashString(key, 8)` and `hashString(key, 16)` are, in general, completely different numbers, because the `% bucketCount` step depends on `bucketCount` itself. This is why resizing can't just copy the old buckets array into a bigger one and call it done — every single stored key/value pair must be **rehashed** against the new bucket count and placed into its (likely different) new bucket. `0.75` as the load-factor threshold is a common real-world choice (matching what many real hash table implementations, including several standard library ones, use by default) — high enough to not waste memory resizing too eagerly, low enough to keep the average chain length short.

### SAVE AND TRY

Insert 6 key/value pairs into a `MyHashMap<std::string, int>(8)` (6 elements, 8 buckets: load factor `0.75`, right at the threshold) and add a temporary debug print inside `resizeIfNeeded` showing `buckets.getSize()` before and after — confirm a resize to 16 buckets actually triggers, and that a `get()` call for every one of the 6 originally-inserted keys still correctly finds its value *after* the resize, proving the rehashing correctly relocated every pair.

## 🎯 Challenge

Finish the `get`/`insert`-update logic left as a placeholder in Step 3: add a way to walk a `MyLinkedList<KeyValuePair<K,V>>`'s chain looking for a matching key (you'll need to either add an iteration-friendly accessor to `MyLinkedList` from LAB-07, or add a `remove`-like method specialized for finding-by-key), so `insert` on an *existing* key updates its value instead of adding a duplicate, and `get` genuinely searches instead of returning a placeholder.

<details>
<summary>Solution</summary>

```cpp
// Add to MyLinkedList.h (LAB-07) -- a way for external code to walk the chain:
template<typename T>
class MyLinkedList {
    // ...existing members...
public:
    Node<T>* getHead() const { return head; } // exposes just enough to let MyHashMap walk it
};
```

```cpp
// MyHashMap.h
void insert(K key, V value) {
    resizeIfNeeded();
    int index = hashString(key, buckets.getSize());
    MyLinkedList<KeyValuePair<K, V>>& bucket = buckets[index];

    Node<KeyValuePair<K, V>>* current = bucket.getHead();
    while (current != nullptr) {
        if (current->value.key == key) {
            current->value.value = value; // UPDATE existing, don't duplicate
            return;
        }
        current = current->next;
    }

    bucket.push_front(KeyValuePair<K, V>(key, value));
    elementCount++;
}

bool get(K key, V& outValue) {
    int index = hashString(key, buckets.getSize());
    MyLinkedList<KeyValuePair<K, V>>& bucket = buckets[index];

    Node<KeyValuePair<K, V>>* current = bucket.getHead();
    while (current != nullptr) {
        if (current->value.key == key) {
            outValue = current->value.value;
            return true;
        }
        current = current->next;
    }
    return false;
}
```

`getHead()` is a deliberately minimal addition to `MyLinkedList` — it exposes just enough (the raw starting node) for external code to walk the chain read-only, without exposing anything that would let outside code corrupt the list's internal structure (LAB-02's encapsulation principle, still holding here even while extending an already-built class). Both `insert`'s update path and `get`'s search path share the identical walk-the-chain-comparing-keys logic, because they're solving the same underlying sub-problem: "does this bucket already contain this key, and if so, where."

</details>

## Mental Model

| Concept | BST (LAB-13) | Hash table (this lab) |
|---|---|---|
| Lookup speed | O(log n) if balanced, O(n) if not | O(1) average, regardless of insertion order |
| Sensitive to insertion order? | Yes — sorted data degrades it | No — hash function determines bucket, not arrival order |
| Sorted traversal | Yes — in-order (LAB-12) visits sorted | No — bucket order has no relationship to key order |
| What degrades it | Unbalanced shape from bad insertion order | A poor hash function, or too high a load factor |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does resizing require rehashing every existing key, not just copying them into a bigger array? | |
| 2 | Why does a hash table sidestep the "sorted input degrades performance" problem LAB-13's BST has? | |
| 3 | What would happen to a `MyHashMap`'s performance if `hashString` always returned `0`? | |

## Quick Check Answers

1. It takes a key (any type — a string, an integer, whatever `K` is) and deterministically produces an integer, which — after being reduced with `% bucketCount` — becomes the index of the bucket that key belongs to.
2. Because a hash function maps a huge space of possible keys down onto a much smaller number of buckets — by the pigeonhole principle, with more possible keys than buckets, some pair of distinct keys is mathematically guaranteed to eventually produce the same bucket index; this is expected and normal, not a defect, which is exactly why chaining (or another collision-resolution strategy) is a required part of any real hash table, not an optional extra.
3. It's the ratio of stored elements to bucket count (`elementCount / bucketCount`) — once it crosses a threshold (commonly around 0.75), the table resizes to a larger bucket count and rehashes everything, done proactively before chains get long enough to meaningfully slow down lookups, rather than waiting until the table is literally 100% full (which, for a chained hash table, isn't even a hard limit at all — chains can always grow longer, just increasingly slowly).

*Next: [LAB-15 — Sorting Algorithms, Visualized](CPP-S02-LAB-15-SORTING-ALGORITHMS.md)*
