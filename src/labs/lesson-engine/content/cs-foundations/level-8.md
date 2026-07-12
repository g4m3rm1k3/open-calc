---
series: cs-foundations
level: 8
title: CS Foundations — Putting It All Together
lang: javascript
---

# CS Foundations — Putting It All Together

Every concept in this series was a lens through which to see the same machine. Bits and bytes are how values are stored. The stack and heap are where those values live. The fetch-decode-execute cycle is how the CPU processes them. Complexity notation is how you reason about how many cycles that processing takes. Recursion is a control-flow pattern that uses the stack. The OS is the layer that creates the process and allocates resources to it.

These are not isolated facts — they are a connected mental model of how software runs. A function call on the stack. A closure's captured variables on the heap. A recursive algorithm's O(2ⁿ) complexity. A server process handling SIGTERM. A hash table's O(1) lookup because of the hash function. When you can see these connections clearly, you can reason about any unfamiliar system from first principles.

This capstone level verifies that the mental model is complete — not by testing recall, but by applying it to scenarios that require synthesising multiple concepts at once.

## The full stack: from code to machine

```text
What actually happens when JavaScript executes:
  function sum(arr) {
    let total = 0
    for (const n of arr) total += n
    return total
  }
  sum([1, 2, 3])

MACHINE LEVEL:
  1. The OS loads the Node.js runtime into a process (its own virtual address space).
  2. The JS engine (V8) reads and compiles sum() into machine code (x86-64 instructions).
  3. sum([1, 2, 3]) is called:
     a. Arguments are placed in registers or on the stack per the ABI.
     b. A stack frame for sum() is pushed.
     c. total (an integer primitive) lives in the stack frame.
     d. arr is a reference — the actual Array object lives on the heap.
     e. The for/of loop: n iterations (here, 3). O(n) time. O(1) extra space.
     f. total += n: a register add instruction, 1 CPU cycle.
  4. sum() returns: result placed in a register, stack frame popped.
  5. Caller receives 6.

TIME: O(n) — one pass through the array.
SPACE: O(1) — total is one variable, no extra data structures.
STACK: 1 frame for sum() + 1 frame for the event loop = constant depth.
HEAP: the Array [1, 2, 3] lives there; sum() does not allocate more.
```

## Connecting complexity to the machine

```text
Why O(n²) is a machine problem, not just a mathematical one:

  function pairSums(arr) {                    // n=10,000
    const sums = []
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length; j++) {
        sums.push(arr[i] + arr[j])            // 100,000,000 push calls
      }
    }
    return sums
  }

  100,000,000 push operations:
    Each push: fetch arr[i] (cache miss?), fetch arr[j] (cache miss?),
               add, push to sums array (possibly resize sums → O(n) copy).
    CPU cycles: ~10 per push with warm cache.
    Total: ~10⁹ cycles.
    At 3 GHz: ~0.33 seconds. But sums grows to 10⁸ entries:
    Memory: 10⁸ × 8 bytes = 800 MB. This may trigger GC or OOM.

  The O(n²) problem is NOT "math says it's slow."
  It is: 10⁹ fetch-decode-execute cycles + 800 MB heap allocation.
  The machine is the reason the complexity class matters.
```

## Recursion + memoisation + complexity — a unified view

```javascript
// Why fibMemo is O(n) and why the memo lives on the heap:

function fibMemo(n, memo = new Map()) {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)   // Map.get: O(1) — one hash lookup, one array access
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  memo.set(n, result)
  return result
}
```

```text
The memo Map is created on first call and passed by reference on every recursive call.
  — "passed by reference" means: only the 8-byte heap address is pushed to each stack frame.
  — The Map object itself (potentially large) lives in one heap location.
  — All 2n+1 calls share the same Map object — no copying.

Stack depth: O(n) — n frames deep on the first descent (fib(n) → fib(n-1) → ... → fib(0)).
  After the first descent, every fib(k) hits the memo. O(1) returns — no more frames pushed.
Stack space: O(n) in the worst case.
Heap space: O(n) — the memo Map holds n entries.
Time: O(n) — each value computed once.

Compare to naive fib:
  Stack depth: O(n) — same.
  Heap space: O(1) — no memo.
  Time: O(2ⁿ) — every subproblem recomputed.

The memoisation trades O(n) heap space for O(2ⁿ) → O(n) time. This is the time-space tradeoff.
```

**CS lens:** Every algorithm has a position in the time-space plane: it uses some amount of time (CPU cycles) and some amount of space (memory). The fundamental theorem of algorithm design is that time and space are often exchangeable — you can trade one for the other. Memoisation trades space for time. Streaming algorithms trade time for space (process data in passes rather than loading it all). Cache-oblivious algorithms are designed to perform well across all levels of the memory hierarchy (registers → L1 cache → L2 → L3 → RAM → SSD) without knowing the specific cache sizes. Understanding the machine is what lets you navigate these tradeoffs rather than accidentally accepting a bad position in the space.

**SE lens:** The mental model from this series is a diagnostic tool for production problems. "The server is slow" → is it CPU-bound (profile the CPU — which instructions?) or I/O-bound (is it waiting on database, network, disk?)? "Memory keeps growing" → is it a heap leak (an object with an unexpected reference keeping it alive) or a genuine accumulation (a cache with no eviction policy)? "The service crashes at high load" → is it OOM (too many heap allocations), stack overflow (deep recursion), or an unhandled process signal? Each question has a precise machine-level answer. The CS foundations are the vocabulary for asking and answering them.

**Common mistakes (summary of the series):**
- Treating all operations as the same speed — they are not. Register access, cache hit, RAM access, SSD read, network read: each is ~100× slower than the previous.
- Ignoring memory locality — data structures that scatter their elements across the heap (linked lists, trees with many small nodes) suffer cache misses. Contiguous arrays stay in cache.
- Recursing without bounding the depth — every stack frame is a fixed memory cost. Unbounded recursion is an unbounded memory claim.
- Missing the hash function's role — Map/Set are fast because hash functions distribute keys uniformly. A bad key type (mutable objects) breaks the uniformity guarantee.

## Challenge: analyse_algorithm

Read this algorithm and answer the questions about its machine-level behaviour.

```challenge
function groupByFirstLetter(words) {
  const groups = new Map()
  for (const word of words) {
    const key = word[0].toLowerCase()   // word[0]: O(1) string character access
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(word)
  }
  return groups
}

const analysis = {
  // Time complexity (in terms of n = words.length)?
  timeComplexity: '',   // 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', or 'O(n^2)'

  // Space complexity (extra memory used)?
  spaceComplexity: '',  // same options

  // Does the result Map live on the stack or heap?
  mapLocation: '',      // 'stack' or 'heap'

  // Is Map.has() O(1) or O(n)?
  mapHasComplexity: '', // 'O(1)' or 'O(n)'

  // What is returned if words = ['apple', 'ant', 'banana', 'avocado']?
  // Describe the keys only (in insertion order as a comma-separated string): e.g. 'a,b'
  returnedKeys: '',
}
```

```test
const a = analysis
assert a.timeComplexity === 'O(n)'
assert a.spaceComplexity === 'O(n)'
assert a.mapLocation === 'heap'
assert a.mapHasComplexity === 'O(1)'
assert a.returnedKeys === 'a,b'
```
