---
series: cs-foundations
level: 4
title: How Data Structures Work in Memory
lang: javascript
---

# How Data Structures Work in Memory

Every data structure is a decision about how to lay out data in memory. That layout determines what operations are fast (O(1)), what operations are slow (O(n)), and what operations are impossible without a full rebuild. The decision between an array and a linked list, between an object and a Map, between a stack and a queue — these are not abstract choices. They are choices about memory layout, and each layout has precise performance consequences.

The goal of this lesson is not to teach how to use data structures — you have done that. The goal is to show what each structure looks like in memory, why that layout produces the performance characteristics it does, and how to choose the right structure for a given problem based on its memory model rather than on habit or intuition.

## Arrays: contiguous memory

An array stores its elements in a contiguous block of memory — one element immediately after the next, with no gaps.

```text
Array: [10, 20, 30, 40, 50]

Memory (each cell is 8 bytes for a 64-bit number):
  Address 1000: 10
  Address 1008: 20
  Address 1016: 30
  Address 1024: 40
  Address 1032: 50

Access element at index i: address = base_address + (i * element_size)
  arr[0] → 1000 + (0 × 8) = 1000 → value: 10    (one calculation, one memory access)
  arr[3] → 1000 + (3 × 8) = 1024 → value: 40    (one calculation, one memory access)

This is O(1) random access. The same formula works for any index.
The CPU does not search — it calculates.
```

```text
Why contiguous memory matters for iteration speed:

  CPU caches work by loading a "cache line" (64 bytes) from RAM in one operation.
  When you access arr[0], the CPU loads arr[0] through arr[7] into cache simultaneously.
  Accessing arr[1] through arr[7] hits the cache — no RAM access needed.

  An array of 1000 elements processed left to right: ~125 cache misses (1000/8).
  A linked list of 1000 elements: potentially 1000 cache misses (each node may be
  at a different RAM address, loaded separately).

  This is why "use arrays for iteration" is not just style — it is physics.
```

```javascript
// Array operations and their costs:
const arr = [1, 2, 3, 4, 5]

arr[2]          // O(1): calculate address, load value
arr.push(6)     // O(1) amortised: append to end (may occasionally resize)
arr.pop()       // O(1): remove from end
arr.unshift(0)  // O(n): must shift ALL existing elements one position right to make room
arr.shift()     // O(n): must shift ALL remaining elements one position left
arr.indexOf(3)  // O(n): must scan from index 0 until found
```

**CS lens:** When an array runs out of pre-allocated space and `push` is called, the runtime allocates a new, larger array (typically 1.5× or 2× the current size), copies all elements, then discards the old array. This is O(n) for a single operation, but happens infrequently enough that the **amortised** cost of push is O(1). Amortised analysis asks: across many operations, what is the average cost per operation? Even though a single resize costs O(n), the operations between resizes are O(1), and the average across all operations is O(1). This is the formal justification for calling `push` O(1).

## Linked lists: nodes with pointers

A linked list stores elements in nodes scattered across the heap. Each node holds a value and a pointer (a memory address) to the next node.

```text
Linked list: 10 → 20 → 30 → 40 → null

Memory (nodes scattered throughout heap):
  Node at address 2100: { value: 10, next: 3500 }
  Node at address 3500: { value: 20, next: 1200 }
  Node at address 1200: { value: 30, next: 4100 }
  Node at address 4100: { value: 40, next: null }

Access element at index 2:
  Start at head (address 2100) — value: 10, next: 3500
  Follow next → address 3500  — value: 20, next: 1200
  Follow next → address 1200  — value: 30  ← index 2
  Three pointer dereferences (three memory accesses). Must start from the beginning.

This is O(n) random access. There is no formula — only traversal.

But prepend (insert at front):
  Create new node { value: 5, next: 2100 }
  head = new node
  One allocation, one pointer update. O(1).
```

```javascript
// When to use a linked list over an array:
// — You prepend frequently (O(1) vs O(n) for arrays)
// — You insert/delete at arbitrary positions after finding the node
//   (insert: O(1) once position is found; finding: O(n))
// — You do NOT need random access by index (that is O(n) for linked lists)

// In JavaScript, arrays are typically faster than linked lists for everything —
// the pointer-chasing overhead and cache-miss cost of linked lists outweighs
// their theoretical advantages except in specific use cases.
```

## Hash tables: O(1) lookup by key

A hash table (the underlying structure of JavaScript's `Map` and plain objects) provides O(1) average-case lookup, insertion, and deletion by key. This is not magic — it is a specific memory layout combined with a mathematical trick.

```text
Hash table with 8 buckets:

  To store ('alice', 30):
    hash('alice') → 2743891 → 2743891 % 8 = 3    (bucket index = 3)
    Store in bucket 3: [('alice', 30)]

  To store ('bob', 25):
    hash('bob') → 5891234 → 5891234 % 8 = 2
    Store in bucket 2: [('bob', 25)]

  To look up 'alice':
    hash('alice') → same calculation → bucket 3
    Check bucket 3 → found ('alice', 30) → return 30

  One hash calculation, one array access. O(1).

  COLLISION: two keys hash to the same bucket.
    hash('eve') → 6 % 8 = 3 (same as 'alice')
    Bucket 3: [('alice', 30), ('eve', 28)]   — both stored in bucket 3
    Lookup 'eve': go to bucket 3, scan the list for key === 'eve'. O(k) where k = bucket size.
    If collisions are rare (good hash function, low load factor), k is usually 1.
    Average case: O(1). Worst case (all keys collide): O(n).
```

```text
Hash function requirements:
  1. DETERMINISTIC: same input always produces same output.
     hash('alice') must always return the same number.
  2. FAST: the hash calculation must be cheap (typically O(key length)).
  3. UNIFORM: outputs should be evenly distributed across buckets.
     A bad hash function that maps everything to bucket 0 degrades to O(n) lookup.

Load factor: (number of entries) / (number of buckets).
  When load factor exceeds ~0.75, the hash table is rehashed:
  more buckets are allocated, all entries are re-inserted. O(n) but rare.
  Amortised insertion: O(1).
```

**CS lens:** The hash table is the data structure that makes dictionaries, sets, and database indexes fast. The O(1) average case is only achievable because the hash function maps keys to positions, turning a search problem into a direct-address lookup. The "average" qualifier matters: adversarial inputs (keys that all hash to the same bucket) can degrade a hash table to O(n). This is the basis of "hash flooding" denial-of-service attacks against web servers — sending carefully chosen keys that all collide, forcing O(n) lookups. Modern runtimes use randomised hash seeds to prevent this.

**SE lens:** Choosing between an array and an object/Map should be driven by the access pattern: if you need to look things up by a unique key, use a Map. If you need to iterate in order or access by position, use an array. Putting 10,000 items in an array and repeatedly calling `array.find(item => item.id === id)` is a design error — it performs O(n) scan every time. Indexing by id into a Map is O(1). The difference is not micro-optimisation at this scale; it is the difference between a responsive system and a slow one.

**Common mistakes:**
- Using object keys when you need ordered iteration — JavaScript objects do not guarantee insertion order for all keys (numeric keys are sorted first). Use a `Map` when insertion order matters.
- Ignoring hash collisions in custom hash functions — a hash function that maps all similar keys to the same bucket (e.g. using only the first character of the string) will produce poor performance.

**Debug tip:** When a Map or object lookup returns `undefined` unexpectedly, check whether the key is the exact same type and value used at insertion time. `map.set(1, 'value')` and `map.get('1')` are different keys — one is a number, one is a string. The hash function treats them differently.

## Challenge: choose_the_structure

Choose the right data structure and explain why for each scenario.

```challenge
const structureChoices = {
  // Scenario 1: You have a list of 50,000 product IDs and need to check
  // whether a given ID is in the list. This check happens thousands of times per second.
  scenario1_structure: '',    // 'array', 'Map', or 'Set'
  scenario1_why: '',

  // Scenario 2: You are building a task queue where tasks are added to the end
  // and removed from the front. You need both operations to be O(1).
  scenario2_structure: '',    // 'array' or 'linked-list'
  scenario2_why: '',

  // Scenario 3: You have user objects and need to look up a user by their string ID
  // many times. The number of users is 100,000.
  scenario3_structure: '',    // 'array' or 'Map'
  scenario3_why: '',

  // Scenario 4: You need to store a list of recent items where you add to the end
  // and read by position (first item, last item, item at index N).
  scenario4_structure: '',    // 'array' or 'linked-list'
  scenario4_why: '',
}
```

```test
const s = structureChoices
assert s.scenario1_structure === 'Set' || s.scenario1_structure === 'Map'
assert s.scenario1_why.length > 15
assert s.scenario2_structure === 'linked-list'
assert s.scenario2_why.toLowerCase().includes('o(1)') || s.scenario2_why.toLowerCase().includes('prepend') || s.scenario2_why.toLowerCase().includes('front')
assert s.scenario3_structure === 'Map'
assert s.scenario3_why.length > 15
assert s.scenario4_structure === 'array'
assert s.scenario4_why.length > 15
```
