# Lesson 16: Cache Performance — Miss Penalties, AMAT, and Writing

## Header

- **Number:** 16
- **Title:** Cache Performance — Miss Penalties, AMAT, and Writing
- **Series:** Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
- **Module:** Module 2 — The Memory Hierarchy
- **Language:** C and arithmetic. Trace by hand. (Simulated in Racket)
- **What you need to know first:** Lessons 00–15 (all of Module 0, Module 1, storage, locality, cache organization).
- **What you will build:** The reader will be able to quantify cache performance using AMAT (Average Memory Access Time), compute miss rates for simple programs, understand write policies' effect on bandwidth, and understand why the miss rate matters more than the hit rate for performance. The transferable insight: a 1% miss rate sounds negligible, but if each miss costs 200 cycles and you miss on 1% of memory accesses, you spend half your time waiting for memory. Cache performance is not about the happy path — it's about the penalty for the unhappy path.

## Objects and Methods

- **AMAT (Average Memory Access Time)**
  - **What it is:** A metric that calculates the average time it takes for a processor to access memory, factoring in both hits and misses across the memory hierarchy.
  - **Implementation:** Calculated using the formula: Hit time + (Miss rate × Miss penalty).
  - **Its use:** Used to evaluate the performance of a cache memory system and compare different cache architectures.
  - **Type:** Mathematical metric / Concept.
  - **Responsibility:** To provide a single unified number representing the expected delay of a memory operation.
  - **Depends on:** Cache hit time, cache miss rate, and the penalty incurred by a miss (accessing lower-level memory).
  - **Connects to:** Cache hierarchy, memory bus latency, program access patterns.
  - **Shape:** A floating-point or rational number representing CPU cycles or nanoseconds.

- **Write-Through Cache**
  - **What it is:** A cache write policy where every write operation to the cache is simultaneously written to the next lower level in the memory hierarchy.
  - **Implementation:** The cache controller directly propagates data to the main memory bus on every store instruction.
  - **Its use:** Used in simple caches where maintaining strict data consistency between cache and main memory is necessary.
  - **Type:** Hardware policy.
  - **Responsibility:** To ensure the lower-level memory always has the most up-to-date copy of a cache block.
  - **Depends on:** Memory bus bandwidth and write buffers to avoid stalling the CPU.
  - **Connects to:** Main memory, write buffers, bus transactions.
  - **Shape:** A continuous stream of small write transactions on the memory bus.

- **Write-Back Cache**
  - **What it is:** A cache write policy where writes are only applied to the cache, and the updated (dirty) block is written to main memory only when it is evicted.
  - **Implementation:** Uses a "dirty bit" for each cache line, set when written to. When an eviction occurs, if the dirty bit is 1, the line is written to memory.
  - **Its use:** Used in high-performance processors to reduce memory bus traffic by coalescing multiple writes to the same block.
  - **Type:** Hardware policy.
  - **Responsibility:** To conserve memory bandwidth while keeping locally modified data readily available.
  - **Depends on:** Eviction policies (e.g., LRU), dirty bits, and cache block size.
  - **Connects to:** Dirty bits, cache evictions, main memory.
  - **Shape:** Bursty, full cache-line sized write transactions to memory upon evictions.

- **Hardware Prefetcher**
  - **What it is:** A specialized hardware component inside the CPU that predicts future memory accesses and loads cache lines before they are explicitly requested.
  - **Implementation:** Uses pattern recognition (like detecting sequential or stride-based accesses) to issue speculative memory reads.
  - **Its use:** Used to hide the high latency of memory misses by having data ready in the cache just as the CPU needs it.
  - **Type:** Hardware component / heuristic algorithm.
  - **Responsibility:** To detect predictable access patterns and proactively pull data into the cache.
  - **Depends on:** Predictable software access patterns (e.g., arrays with consistent strides) and available memory bandwidth.
  - **Connects to:** Memory controllers, L1/L2 caches, CPU execution units.
  - **Shape:** Speculative background read requests traversing the memory bus.

---

## 1. Average Memory Access Time (AMAT)

### The AMAT Formula

When analyzing cache, we do not only care about how often we find data (the hit rate). We must evaluate the **Average Memory Access Time (AMAT)**. AMAT combines the happy path (finding data in the cache) and the unhappy path (fetching data from a slower level).

The formula is:
AMAT = Hit time + (Miss rate × Miss penalty)

- **Hit time (h):** Cycles to access the cache on a hit.
- **Miss rate (m):** Fraction of accesses that miss.
- **Miss penalty (p):** Additional cycles to fetch from the next level on a miss.

We will simulate this in a Racket throwaway lab.

```racket
#lang racket
;; Throwaway Lab: Single-Level AMAT Calculation
(define (calculate-amat hit-time miss-rate miss-penalty)
  (+ hit-time (* miss-rate miss-penalty)))

(define h 4)       ;; 4 cycles for L1 hit
(define m 0.10)    ;; 10% miss rate
(define p 100)     ;; 100 cycles DRAM access

(display "AMAT (10% miss rate): ")
(display (calculate-amat h m p))
(newline)

(display "AMAT (0.1% miss rate): ")
(display (calculate-amat h 0.001 p))
(newline)

;; Output:
;; AMAT (10% miss rate): 14.0
;; AMAT (0.1% miss rate): 4.1
```

As the code shows, even with a 10% miss rate, the AMAT is 14 cycles—3.5 times slower than the 4-cycle hit time. At a 0.1% miss rate, the AMAT is 4.1, which is practically identical to the hit time. 

### Multi-Level Cache AMAT

Most modern CPUs have a two- or three-level hierarchy. For a two-level hierarchy, the miss penalty of L1 is essentially the AMAT of L2:
AMAT = h1 + m1 × (h2 + m2 × p_DRAM)

Let's calculate this using another Racket snippet.

```racket
#lang racket
;; Throwaway Lab: Two-Level AMAT Calculation
(define (calculate-l2-amat h1 m1 h2 m2 p-dram)
  (+ h1 (* m1 (+ h2 (* m2 p-dram)))))

(define h1 4)
(define m1 0.10)
(define h2 12)
(define m2 0.50)
(define p-dram 200)

(display "Two-level AMAT: ")
(display (calculate-l2-amat h1 m1 h2 m2 p-dram))
(newline)

;; Output:
;; Two-level AMAT: 15.2
```

The penalty cascades: you pay the L1 hit time no matter what. If you miss, you pay the L2 hit time. If you miss there, you pay the DRAM penalty.

---

## 2. Why Miss Rate Dominates — The Asymmetry of Penalties

### The Asymmetry of Penalties

A 99% hit rate sounds exceptional in a vacuum. But cache performance is highly asymmetric: a hit takes ~4 cycles, while a miss takes ~200 cycles. A single miss destroys the time savings of 50 hits. 

Let's trace out four scenarios for iterating over N=1,000,000 elements in C, translating the logic to Racket.

```racket
#lang racket
;; Throwaway Lab: Performance Scenarios for N=1000000
#|
C Code reference:
/* Scenario 1: 0% miss rate (everything in L1) */
/* Scenario 2: 1% miss rate (1 in 100 goes to DRAM) */
/* Scenario 3: 10% miss rate */
/* Scenario 4: 50% miss rate (stride too large) */
|#

(define (total-cycles n hit-time miss-rate miss-penalty)
  (* n (+ hit-time (* miss-rate miss-penalty))))

(define N 1000000)

(printf "Scenario 1 (0%% miss):  ~a cycles~n" (total-cycles N 4 0.00 200))
(printf "Scenario 2 (1%% miss):  ~a cycles~n" (total-cycles N 4 0.01 200))
(printf "Scenario 3 (10%% miss): ~a cycles~n" (total-cycles N 4 0.10 200))
(printf "Scenario 4 (50%% miss): ~a cycles~n" (total-cycles N 4 0.50 200))

;; Output:
;; Scenario 1 (0% miss):  4000000.0 cycles
;; Scenario 2 (1% miss):  6000000.0 cycles
;; Scenario 3 (10% miss): 24000000.0 cycles
;; Scenario 4 (50% miss): 104000000.0 cycles
```

Notice that moving from a 0% miss rate to a 1% miss rate slows the program down by 50% (from 4M cycles to 6M cycles). At a 10% miss rate, execution takes 6 times as long. The hit rate is a distraction; the MISS rate × MISS PENALTY dictates your runtime.

---

## 3. Computing Miss Rates for Simple Loops

### Miss Rates in Loops

Let's assume a tiny cache system:
- 4 sets
- Direct-mapped
- 2 `long` elements per cache line (16 bytes/line, since a `long` is 8 bytes).
We have an array `long a[16];` taking up 128 bytes (8 cache lines).

We will write a simulator to see how stride-1 and stride-2 accesses perform.

```racket
#lang racket
;; Throwaway Lab: Cache Simulator for Loop Accesses
#|
C code:
long a[16];
/* Loop 1: stride-1 */
for (int i = 0; i < 16; i++) sum += a[i];

/* Loop 2: stride-2 */
for (int i = 0; i < 16; i += 2) sum += a[i];
|#

(define (simulate-cache-misses stride total-elements elements-per-line)
  (define misses 0)
  (define accesses 0)
  (for ([i (in-range 0 total-elements stride)])
    (set! accesses (add1 accesses))
    ;; If the element index is the start of a new line, it's a miss
    (when (= (modulo i elements-per-line) 0)
      (set! misses (add1 misses))))
  (printf "Stride-~a: ~a misses out of ~a accesses (~a%% miss rate)~n" 
          stride misses accesses (* (/ misses accesses) 100.0)))

(simulate-cache-misses 1 16 2)
(simulate-cache-misses 2 16 2)

;; Output:
;; Stride-1: 8 misses out of 16 accesses (50.0% miss rate)
;; Stride-2: 8 misses out of 8 accesses (100.0% miss rate)
```

In the stride-1 loop, reading `a[0]` causes a cold miss. The cache fetches `a[0]` AND `a[1]` into the 16-byte block. Thus, `a[1]` is a hit. We miss exactly once every 2 accesses: 50% miss rate.

In the stride-2 loop, reading `a[0]` misses and loads `a[0]` and `a[1]`. Then we jump to `a[2]`, which misses and loads `a[2]` and `a[3]`. Because our stride skips the useful second element in every fetched block, we miss on *every single access*: 100% miss rate.

---

## 4. Write Policies and Their Bandwidth Implications

### Write Policies

Handling memory reads is straightforward, but what happens when you write to a cache? There are two primary approaches:

1. **Write-Through Cache:** Every write to the cache also immediately writes to the next level (DRAM). This generates a memory bus transaction for every single write instruction. If you write N elements to an array, you send N small packets across the bus, easily saturating the bandwidth.
2. **Write-Back Cache:** Writes only go to the cache. The CPU marks the cache line as "dirty" (modified). DRAM is only updated when that dirty line is evicted to make room for new data. This coalesces N small writes into a single bursty eviction of one large cache block.

Furthermore, on a write miss:
- **Write-allocate (usually paired with write-back):** The CPU loads the target block into the cache, modifies it locally, and marks it dirty. Excellent if you will read the data again shortly.
- **No-write-allocate (usually paired with write-through):** The CPU bypasses the cache entirely and writes directly to DRAM. Excellent for streaming data that you write once and never touch again.

```racket
#lang racket
;; Throwaway Lab: Write Bandwidth Simulator
#|
C code:
for (int i = 0; i < N; i++) a[i] = 0;
|#

(define (compare-write-bandwidth N elements-per-line bytes-per-element)
  (define write-through-transactions N)
  (define write-through-bytes (* N bytes-per-element))
  
  (define evictions (/ N elements-per-line))
  (define write-back-bytes (* evictions elements-per-line bytes-per-element))
  
  (printf "Write-Through: ~a transactions, ~a bytes~n" 
          write-through-transactions write-through-bytes)
  (printf "Write-Back: ~a evictions (bursts), ~a bytes~n" 
          evictions write-back-bytes))

(compare-write-bandwidth 1000 8 8)

;; Output:
;; Write-Through: 1000 transactions, 8000 bytes
;; Write-Back: 125 evictions (bursts), 8000 bytes
```

Both send 8000 bytes, but write-back does it in 125 large, efficient bursts rather than 1000 tiny transactions. Write-back heavily optimizes bus utilization.

---

## 5. The L1/L2/L3 Hierarchy in a Real CPU — Modern Numbers

### Real CPU Cache Hierarchy

Let's look at real metrics from a modern multi-level cache architecture.

| Level     | Size  | E   | Block| Hit Time | Local Miss | Total Miss Penalty |
|-----------|-------|-----|------|----------|------------|--------------------|
| Registers | 256B  | N/A | N/A  | 1 cy     | N/A        | N/A                |
| L1-D      | 32KB  | 8   | 64B  | 4 cy     | 10%        | 4 + 0.10*(L2...)   |
| L2        | 256KB | 8   | 64B  | 12 cy    | 5%         | 12 + 0.05*(L3...)  |
| L3        | 8MB   | 16  | 64B  | 40 cy    | 1%         | 40 + 0.01*(200)    |
| DRAM      | 16GB  | -   | -    | 200 cy   | -          | 200                |

We can resolve this massive hierarchy from the inside out.

```racket
#lang racket
;; Throwaway Lab: Full Modern CPU AMAT
(define l1-hit 4)
(define l1-miss-rate 0.10)

(define l2-hit 12)
(define l2-miss-rate 0.05)

(define l3-hit 40)
(define l3-miss-rate 0.01)

(define dram-penalty 200)

;; Step 1: L3 AMAT (Time to satisfy a miss in L2)
(define l3-amat (+ l3-hit (* l3-miss-rate dram-penalty)))

;; Step 2: L2 AMAT (Time to satisfy a miss in L1)
(define l2-amat (+ l2-hit (* l2-miss-rate l3-amat)))

;; Step 3: Global AMAT
(define global-amat (+ l1-hit (* l1-miss-rate l2-amat)))

(printf "L3 AMAT: ~a~n" l3-amat)
(printf "L2 AMAT: ~a~n" l2-amat)
(printf "Global AMAT: ~a~n" global-amat)

;; Output:
;; L3 AMAT: 42.0
;; L2 AMAT: 14.1
;; Global AMAT: 5.41
```

The L3 miss penalty is 1% × 200 = 2 cycles. Added to the L3 hit time of 40, an L2 miss costs 42 cycles.
The L2 miss penalty is 5% × 42 = 2.1 cycles. Added to the L2 hit time of 12, an L1 miss costs 14.1 cycles.
The global AMAT is 4 + 0.10 × 14.1 = 5.41 cycles. 

---

## 6. Prefetching — Hiding Miss Penalty

### Prefetching

The **Hardware Prefetcher** is a dedicated unit in the CPU that monitors your access patterns. If it notices you requesting `a[0]`, `a[1]`, `a[2]`, it will actively issue memory requests for `a[3]` and `a[4]` *before* your program asks for them. If successful, the data arrives in L1 just as the CPU needs it, rendering the miss penalty effectively zero.

Software can also guide the hardware using compiler built-ins.

```racket
#lang racket
;; Throwaway Lab: Prefetch Simulation Impact
#|
C code:
/* Sequential access: hardware prefetcher detects stride-1 */
for (int i = 0; i < N; i++) sum += a[i];

/* Software prefetch hint */
for (int i = 0; i < N; i++) {
    __builtin_prefetch(&a[i + 16], 0, 1);
    sum += a[i];
}
|#

(define (simulate-prefetch N miss-rate standard-penalty prefetch-penalty)
  (define standard-cycles (* N (+ 4 (* miss-rate standard-penalty))))
  (define prefetch-cycles (* N (+ 4 (* miss-rate prefetch-penalty))))
  (printf "Without Prefetch: ~a cycles~n" standard-cycles)
  (printf "With Prefetch:    ~a cycles~n" prefetch-cycles))

;; With prefetching, the effective penalty drops to near zero
(simulate-prefetch 10000 0.125 200 0)

;; Output:
;; Without Prefetch: 290000.0 cycles
;; With Prefetch:    40000.0 cycles
```

`__builtin_prefetch(addr, rw, locality)` instructions explicitly fetch data into the cache. The `rw` flag sets read(0) or write(1), and `locality` dictates which cache levels should hold it. Use this only when the hardware prefetcher fails (e.g., in random-ish but predictable accesses like traversing a linked list).

---

## 7. Putting It Together — Why Two Loops with Identical Work Have Different Performance

### Loop Performance Comparison

Consider two loops summing a massive 2D array:
`double A[N][N];` where N = 4096. The array is 128 MB, vastly larger than the L3 cache.

Loop A iterates by row (stride-1 in C, which uses row-major order).
Loop B iterates by column. 

Let's compute their exact AMATs using a final Racket block.

```racket
#lang racket
;; Throwaway Lab: Row-Major vs Column-Major 2D Access
#|
C code:
#define N 4096
double A[N][N];

/* Loop A: row-major access */
for (int i = 0; i < N; i++)
    for (int j = 0; j < N; j++)
        sum += A[i][j];

/* Loop B: column-major access */
for (int j = 0; j < N; j++)
    for (int i = 0; i < N; i++)
        sum += A[i][j];
|#

(define DRAM-PENALTY 200)
(define HIT-TIME 4)

;; Loop A: Stride-1. 64 byte cache line / 8 bytes per double = 8 elements.
;; Miss rate = 1/8 = 12.5%. Hardware prefetcher successfully hides penalty.
(define loop-a-effective-miss 0.0)
(define loop-a-amat (+ HIT-TIME (* loop-a-effective-miss DRAM-PENALTY)))

;; Loop B: Stride-4096. 4096 * 8 bytes = 32768 byte jump.
;; Every access lands in a new cache line. Miss rate = 100%. 
;; Hardware prefetcher cannot predict effectively or bandwidth saturates.
(define loop-b-effective-miss 1.0)
(define loop-b-amat (+ HIT-TIME (* loop-b-effective-miss DRAM-PENALTY)))

(printf "Loop A (Row-major) AMAT: ~a cycles~n" loop-a-amat)
(printf "Loop B (Column-major) AMAT: ~a cycles~n" loop-b-amat)
(printf "Ratio: Loop B is ~ax slower!~n" (/ loop-b-amat loop-a-amat))

;; Output:
;; Loop A (Row-major) AMAT: 4.0 cycles
;; Loop B (Column-major) AMAT: 204.0 cycles
;; Ratio: Loop B is 51.0x slower!
```

Loop A fetches a 64-byte block, takes 1 cold miss, and enjoys 7 hits, with the prefetcher hiding the cold miss latency entirely. AMAT ≈ 4 cycles.
Loop B fetches a 64-byte block, uses 1 element, then skips 32,768 bytes ahead. Every single access is a cold miss. AMAT = 204 cycles.
Though both do the exact same arithmetic, Loop B is 51× slower due purely to cache architecture.

---

## Self-Check

1. **Compute AMAT for a direct-mapped cache with a 5% miss rate and 50-cycle miss penalty (assume 4-cycle hit time).**
   - AMAT = 4 + 0.05 × 50 = 4 + 2.5 = 6.5 cycles.

2. **Calculate how many bus cycles are needed to fetch 8 missed cache lines back-to-back on a 64-bit (8-byte) bus. Assume a cache line is 64 bytes.**
   - 1 cache line = 64 bytes. Bus is 8 bytes wide.
   - 1 line requires 64 / 8 = 8 bus transfers.
   - 8 lines require 8 × 8 = 64 bus transfers.

3. **Compute the miss rate for a stride-4 access pattern on a cache with 8 elements per line.**
   - Element 0 is accessed -> Miss. Block loads elements 0 through 7.
   - Element 4 is accessed -> Hit (it's in the block).
   - Element 8 is accessed -> Miss. Block loads elements 8 through 15.
   - Elements are hit half the time. Miss rate is 50%.
