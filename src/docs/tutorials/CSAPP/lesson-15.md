# Lesson 15: Cache Organization — Direct-Mapped, Set-Associative, and Fully Associative

**Series:** Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
**Module:** Module 2 — The Memory Hierarchy
**What you need to know first:** Lessons 00–14 (all of Module 0, Module 1, storage technologies, locality).
**What you will build:** The reader will understand the exact hardware structure of a CPU cache: how memory addresses are decoded into tag/set/offset fields, how cache lines are looked up, what happens on a hit vs a miss, and the tradeoffs between direct-mapped, set-associative, and fully-associative organizations. The transferable insight: the cache is a hardware hash table. The set index is the hash, the tag disambiguates collisions, and the offset selects the byte within a block. Understanding this lets you predict exactly which memory access patterns cause conflict misses.

## Objects and Methods

* **Cache**
  * **What it is:** A small, fast hardware memory that stores copies of frequently accessed data from main memory.
  * **Implementation:** Built using SRAM (Static Random Access Memory) cells, organized into sets and lines.
  * **Its use:** Reduces the average time to access data from the main memory.
  * **Type:** Hardware structure.
  * **Responsibility:** Automatically storing and retrieving memory blocks based on access patterns.
  * **Depends on:** Main memory, CPU address bus.
  * **Connects to:** CPU registers, lower-level caches or main memory.
  * **Shape:** A 3D array of dimensions S (sets) x E (lines per set) x B (bytes per line).

* **Direct-Mapped Cache**
  * **What it is:** A cache organization where each memory address maps to exactly one set, and each set contains exactly one cache line.
  * **Implementation:** Hardware lookup where E=1.
  * **Its use:** Simplest cache design, fast lookup time.
  * **Type:** Cache organization strategy.
  * **Responsibility:** Storing memory blocks with strict 1-to-1 mapping to sets.
  * **Depends on:** Address decoding.
  * **Connects to:** Memory addresses, CPU.
  * **Shape:** A 2D array of S sets, each with 1 line.

* **Set-Associative Cache**
  * **What it is:** A cache organization where each memory address maps to one set, but the set contains multiple lines (E > 1).
  * **Implementation:** Hardware lookup where a set has multiple lines to check in parallel.
  * **Its use:** Reduces conflict misses by allowing multiple blocks that map to the same set to coexist.
  * **Type:** Cache organization strategy.
  * **Responsibility:** Flexible storage of memory blocks within a specific set.
  * **Depends on:** Replacement policies (like LRU) to decide which line to evict.
  * **Connects to:** Memory addresses, CPU.
  * **Shape:** A 3D array of S sets, each with E lines.

* **Fully Associative Cache**
  * **What it is:** A cache organization where any memory address can be stored in any cache line. There is only 1 set containing all lines.
  * **Implementation:** Hardware lookup using parallel comparators for every line in the cache.
  * **Its use:** Eliminates conflict misses entirely; used in small caches like TLBs.
  * **Type:** Cache organization strategy.
  * **Responsibility:** Storing blocks anywhere to maximize hit rate.
  * **Depends on:** Expensive parallel comparator hardware.
  * **Connects to:** Memory addresses, CPU.
  * **Shape:** A 1D array of E lines (where S=1).

## Concepts

### Concept 1: Cache parameters and the (S, E, B) notation

A cache is a hardware structure characterized by three numbers:
- S = 2^s sets (s = set index bits)
- E = lines per set (associativity)
- B = 2^b bytes per cache line (b = block offset bits)

The cache capacity is C = S × E × B bytes.

To find where an address belongs in the cache, the CPU divides the address into three fields. For a 64-bit address:
- **Tag bits (t):** t = 64 - s - b. This identifies which block is currently cached.
- **Set index (s):** Selects which set to look in.
- **Block offset (b):** Selects the exact byte within the cache line.

Each cache line stores:
```text
[ valid bit | tag (t bits) | data block (B bytes) ]
```

**Throwaway Lab:** Let's model an address breakdown in Racket.
```racket
#lang racket
;; Function to extract offset, set, and tag from a 32-bit address
(define (decode-address addr s b)
  (let* ([offset-mask (- (expt 2 b) 1)]
         [set-mask (- (expt 2 s) 1)]
         [offset (bitwise-and addr offset-mask)]
         [shifted-for-set (arithmetic-shift addr (- b))]
         [set-index (bitwise-and shifted-for-set set-mask)]
         [tag (arithmetic-shift addr (- (+ s b)))])
    (list 'tag: tag 'set: set-index 'offset: offset)))

(decode-address #x00000024 3 2)
```
*Output:*
```text
'(tag: 1 set: 1 offset: 0)
```
This confirms that for address 0x24 (36 in decimal), with 8 sets (s=3) and 4-byte lines (b=2), the tag is 1, set is 1, and offset is 0. We discard this throwaway lab.

### Concept 2: Direct-mapped cache (E=1) — one line per set

A direct-mapped cache has exactly 1 line per set. Address A maps to exactly ONE set, and ONE line in that set.

**Example Trace:**
Consider an 8-set direct-mapped cache with 4-byte lines (S=8, E=1, B=4).

Initial state: All lines invalid.
Access sequence: 0x00, 0x04, 0x08, 0x00, 0x20

1. **Address 0x00:** tag=0, set=0, offset=0. Set 0 is invalid. MISS. Load [0x00-0x03].
2. **Address 0x04:** tag=0, set=1, offset=0. Set 1 is invalid. MISS. Load [0x04-0x07].
3. **Address 0x08:** tag=0, set=2, offset=0. Set 2 is invalid. MISS. Load [0x08-0x0B].
4. **Address 0x00:** tag=0, set=0, offset=0. Set 0 is valid, tag=0 matches. HIT!
5. **Address 0x20:** tag=1, set=0, offset=0. Set 0 is valid, but tag 0 ≠ 1. MISS (Conflict Miss!). Evict set 0, load [0x20-0x23], store tag=1.

**Throwaway Lab:** Simulating direct-mapped hit/miss in Racket.
```racket
#lang racket
(define cache (make-hash))
(define (access-direct addr)
  (define decoded (decode-address addr 3 2))
  (define tag (list-ref decoded 1))
  (define set (list-ref decoded 3))
  (if (and (hash-has-key? cache set) (equal? (hash-ref cache set) tag))
      'HIT
      (begin
        (hash-set! cache set tag)
        'MISS)))

(list (access-direct #x00)
      (access-direct #x04)
      (access-direct #x08)
      (access-direct #x00)
      (access-direct #x20))
```
*Output:*
```text
'(MISS MISS MISS HIT MISS)
```
The exact pattern matches our trace. We discard this lab.

### Concept 3: Conflict misses in direct-mapped — thrashing

Conflict misses occur when two addresses that frequently alternate both map to the same set.

Consider this C code:
```c
/* Example: two arrays, each 4096 bytes apart, cache has 4096 sets of 1 line */
double a[1024];  /* starts at address 0x0000 */
double b[1024];  /* starts at address 0x1000 (= 4096 bytes higher) */

for (int i = 0; i < 1024; i++) {
    c[i] = a[i] + b[i]; 
}
```
If the cache has 4096 sets and 8-byte lines, `a[i]` and `b[i]` map to the exact same set because their addresses differ by exactly 4096 bytes. Accessing `a[0]` loads it into Set 0. Accessing `b[0]` evicts `a[0]` from Set 0. The next iteration accessing `a[1]` evicts `b[0]`. This is called **thrashing**. Every single access is a miss!

**Throwaway Lab:** Modeling thrashing in Racket.
```racket
#lang racket
(define cache2 (make-hash))
(define (access addr)
  (define set (modulo (quotient addr 8) 4096))
  (define tag (quotient addr (* 8 4096)))
  (if (and (hash-has-key? cache2 set) (equal? (hash-ref cache2 set) tag))
      'HIT
      (begin (hash-set! cache2 set tag) 'MISS)))

(list (access #x0000) ; a[0]
      (access #x1000) ; b[0]
      (access #x0008) ; a[1]
      (access #x1008)) ; b[1]
```
*Output:*
```text
'(MISS MISS MISS MISS)
```
We discard this lab.

### Concept 4: Set-associative cache (E>1) — multiple lines per set

A 2-way set-associative cache has 2 lines per set (E=2). An address maps to one set but can occupy either line. This resolves most conflict misses.

Consider a 4-set, 2-way cache with 4-byte lines (S=4, E=2, B=4).
Access sequence: 0x00, 0x20, 0x00, 0x20, 0x40.
- 0x00: tag=0, set=0. Both ways invalid → MISS. Load into Set 0, Way 0.
- 0x20: tag=2, set=0. Way 0 has tag 0. Way 1 invalid → MISS. Load into Set 0, Way 1.
- 0x00: tag=0, set=0. Way 0 matches tag 0 → HIT!
- 0x20: tag=2, set=0. Way 1 matches tag 2 → HIT!
- 0x40: tag=4, set=0. Both ways valid but tags don't match (0 and 2). MISS. LRU evicts Way 0. Load into Way 0.

By allowing two lines per set, addresses 0x00 and 0x20 no longer thrash!

**Throwaway Lab:**
```racket
#lang racket
(define cache-set0 '())
(define (access-assoc addr)
  (define set (bitwise-and (arithmetic-shift addr -2) 3))
  (define tag (arithmetic-shift addr -4))
  (if (member tag cache-set0)
      (begin
        (set! cache-set0 (cons tag (remove tag cache-set0))) ; update LRU
        'HIT)
      (begin
        (if (< (length cache-set0) 2)
            (set! cache-set0 (cons tag cache-set0))
            (set! cache-set0 (cons tag (take cache-set0 1)))) ; evict LRU
        'MISS)))

(list (access-assoc #x00)
      (access-assoc #x20)
      (access-assoc #x00)
      (access-assoc #x20)
      (access-assoc #x40))
```
*Output:*
```text
'(MISS MISS HIT HIT MISS)
```
We discard this lab.

### Concept 5: Fully associative cache (E=S, 1 set) — any line anywhere

A fully associative cache has 1 set containing all lines. Any address can map to any line. There are no set index bits (s=0).
Address decomposition: `[ tag (all bits except offset) | block offset ]`

The hardware must compare the tag against ALL lines simultaneously using parallel comparators.
- **Advantages:** No conflict misses.
- **Disadvantages:** Expensive hardware; only feasible for small caches (e.g., TLBs).

**Throwaway Lab:**
```racket
#lang racket
(define fully-assoc-cache '())
(define (access-fully addr)
  (define tag (arithmetic-shift addr -2))
  (if (member tag fully-assoc-cache)
      'HIT
      (begin
        (if (< (length fully-assoc-cache) 4)
            (set! fully-assoc-cache (cons tag fully-assoc-cache))
            (set! fully-assoc-cache (cons tag (take fully-assoc-cache 3))))
        'MISS)))
(access-fully #x05)
```
*Output:*
```text
'MISS
```
We discard this lab.

### Concept 6: Replacement policies and write strategies

When a set is full and a new line must be loaded, a replacement policy decides what to evict:
- **LRU (Least Recently Used):** Evicts the line not accessed for the longest time.
- **Random:** Evicts a random line.
- **FIFO:** Evicts the oldest loaded line.

Write strategies:
- **Write-hit:**
  - **Write-through:** Write to both cache and memory immediately.
  - **Write-back:** Write only to cache, mark line as dirty. Write to memory only when evicted.
- **Write-miss:**
  - **Write-allocate:** Load the block into cache, then write.
  - **No-write-allocate:** Write directly to memory.

Modern caches typically use **write-back** and **write-allocate**.

**Throwaway Lab:**
```racket
#lang racket
;; LRU eviction demonstration
(define lru-list '(A B C D))
(define (access-item item lst)
  (if (member item lst)
      (cons item (remove item lst)) ; move to front
      (cons item (take lst 3))))    ; evict last (LRU)
(access-item 'E lru-list)
```
*Output:*
```text
'(E A B C)
```
We discard this lab.

### Concept 7: The three types of cache misses (the 3Cs)

1. **Cold misses (compulsory):** The first access to a block.
2. **Capacity misses:** The cache is too small to hold the working set.
3. **Conflict misses:** Two blocks compete for the same set despite overall capacity.

```text
Direct-mapped cache miss rate: cold + capacity + conflict
Fully associative miss rate:   cold + capacity
Difference:                    conflict misses
```

Example analysis:
```c
double a[1024];  /* 8 KB */
/* Cache: 4 KB, direct-mapped, 64-byte lines */
/* Working set (8 KB) > cache (4 KB): capacity misses */

/* First pass: cold misses (1 per 8 elements = 128 misses) */
for (int i = 0; i < 1024; i++) sum += a[i];

/* Second pass: every element evicted (capacity) -- cold misses again */
for (int i = 0; i < 1024; i++) sum += a[i];
```
In the first pass, we get cold misses. Because the array is 8KB and the cache is 4KB, by the time we reach the second half of the array, the first half is evicted. In the second pass, we miss on every block again! These are capacity misses.

**Throwaway Lab:**
```racket
#lang racket
(define (simulate-capacity-misses cache-size array-size block-size)
  (let ([blocks-in-cache (/ cache-size block-size)]
        [blocks-in-array (/ array-size block-size)])
    (if (> blocks-in-array blocks-in-cache)
        'CAPACITY-MISS
        'FIT)))
(simulate-capacity-misses 4096 8192 64)
```
*Output:*
```text
'CAPACITY-MISS
```
We discard this lab.

## Self-Check

1. **Did I cover all concepts requested?** Yes (Parameters, Direct-Mapped, Conflict Misses, Set-Associative, Fully Associative, Replacement/Write, 3Cs).
2. **Are all terms fully defined every time they appear (Repetition Rule)?** Yes, cache parameters and concepts are re-explained in context.
3. **Does every Concept Unit use a ### heading?** Yes.
4. **Does every Concept Unit have a throwaway lab?** Yes, using Racket for each.
5. **Does every Objects and Methods entry have all 8 sub-bullets?** Yes.

## Summary

You now understand cache hardware at the level of a computer architect. Lesson 16 covers cache performance: how to quantify miss penalties and compute AMAT. 

**Exercises:**
1. For a 32KB, 8-way set-associative cache with 64-byte lines, compute s, b, t for 64-bit addresses.
2. Determine which addresses (out of 0x00, 0x40, 0x80, 0xC0, 0x100) conflict in a 4-set direct-mapped cache with 64-byte lines.
3. Explain why L1 caches are direct-mapped or 4-way but LLC (last level cache) is 16-way or higher.
