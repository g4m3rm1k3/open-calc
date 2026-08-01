# SE Masterclass — LAB-08 — Complexity

**Language: JavaScript (Node.js)** *(returning to JS from LAB-01, bridging into Module 2)*
*Why JavaScript here:* This is the last lab of Module 1, and Module 2 (LAB-09 onward) builds one continuous JavaScript project. Complexity analysis also benefits from a fast, simple benchmarking loop — Node.js gives you that with zero setup.

**Prerequisites:** LAB-01 through LAB-07. This lab looks BACK at code you already wrote — the memoized `fib` from LAB-02, the hash map from LAB-04, the binary search tree from LAB-06 — and gives their performance characteristics a name and a notation.

**What this lab adds:**
- Big-O notation: what it measures (growth rate) and what it deliberately ignores (constants, exact timing)
- The common complexity classes, each demonstrated by timing real code: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)
- Why the SAME problem can be O(n²) or O(n) depending only on which data structure you choose
- Space complexity — the memory-side counterpart to time complexity

**Time:** 75–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If a function takes 1ms for 10 items and 100ms for 1,000 items (100x the input, 100x the time), roughly what complexity class is that?
> 2. Binary search on a sorted array of 1,000,000 items takes about 20 comparisons. Linear search takes up to 1,000,000. What's the name for that huge gap?
> 3. Is a function that always takes exactly 500ms, regardless of input size, "slow" or "fast" in Big-O terms?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node main.js` prints:

```
=== O(1): Constant Time ===
array[500000] at size 1000: 0.001ms
array[500000] at size 1000000: 0.001ms
  ← same cost regardless of array size

=== O(n): Linear Time ===
sum of 1000 items: 0.021ms
sum of 10000 items: 0.198ms
sum of 100000 items: 1.847ms
  ← roughly 10x input = roughly 10x time

=== O(n²): Quadratic Time ===
duplicates (naive) in 1000 items: 3.412ms
duplicates (naive) in 2000 items: 13.777ms
  ← 2x input = roughly 4x time (2² = 4)

=== O(n) fix using a Hash Set ===
duplicates (hash set) in 1000 items: 0.089ms
duplicates (hash set) in 2000 items: 0.161ms
  ← same problem, same answer, radically different growth

=== O(log n): Binary Search ===
found 743891 in sorted array of 1000000 after 20 comparisons
linear search for same value took 743892 comparisons

=== O(n log n): Merge Sort vs O(n²): Bubble Sort ===
bubble sort 2000 items: 47.223ms
merge sort 2000 items: 0.892ms

=== O(2^n): Exponential Time ===
naive fib(28): 3.128ms (317811, 832039 calls)
memoized fib(28): 0.019ms (317811, 28 calls)
```

*(Exact millisecond values will differ on your machine — the RATIOS between them are what matter.)*

---

### Concept: What Big-O Actually Measures

**What it is:** Big-O notation describes how an algorithm's cost (time or memory) GROWS as the input size (`n`) grows — not the exact number of milliseconds or bytes. It answers "if I double the input, roughly how much more work happens?" not "how many milliseconds does this take on my laptop?"

**The problem before:** "This function is fast" is meaningless without saying fast FOR WHAT SIZE. A function that takes 1ms for 10 items might take 10 seconds for 10 million items — or it might still take 1ms. Without a way to describe GROWTH, you cannot predict how code will behave at a size you haven't tested yet.

**The solution:** Big-O strips away everything except the growth trend as `n` gets large: constants are dropped (`O(2n)` is written `O(n)`), lower-order terms are dropped (`O(n² + n)` is written `O(n²)`, since the `n²` term dominates once `n` is large), and machine-specific speed is irrelevant (a slow computer running an O(n) algorithm still only does `n` units of work — it just takes longer per unit).

**Canonical example (General Explanation):**

Think of two delivery strategies. Strategy A drives to a distribution center once (fixed cost), then hands off however many packages. Strategy B makes one trip PER package. Strategy A's total trips don't grow with package count — that's O(1). Strategy B's trips grow exactly linearly with package count — that's O(n). If you have 10 packages, the difference might not matter. If you have 10 million, Strategy B collapses.

```js
function first(arr) {
  return arr[0]           // O(1) — one operation, regardless of array size
}

function sum(arr) {
  let total = 0
  for (const x of arr) total += x   // O(n) — one operation PER element
  return total
}
```

**Project Application (The "Why" here):**

Every function you've written in this curriculum has a complexity class, whether you named it or not. LAB-04's `HashMap.get()` is O(1). LAB-06's binary-search-tree `contains()` is O(log n) — because it eliminates half the remaining tree at every step, exactly like the binary search you'll build in this lab. LAB-02's naive Fibonacci was O(2ⁿ); the memoized version was O(n). This lab makes those names explicit and lets you MEASURE them.

**Watch for:** Big-O describes the WORST case unless stated otherwise. A hash map lookup is "O(1) average case" but can degrade to O(n) in a pathological worst case (LAB-04's collision chaining) — real engineering requires knowing which case you're being promised.

---

## Step 1 — A Benchmarking Helper

```js
// benchmark.js — reusable timing helper for the rest of this lab

function benchmark(label, fn) {
  const start = process.hrtime.bigint()   // nanosecond-precision timer, built into Node.js
  fn()
  const end = process.hrtime.bigint()
  const ms = Number(end - start) / 1_000_000   // convert nanoseconds to milliseconds
  console.log(`${label}: ${ms.toFixed(3)}ms`)
  return ms
}

module.exports = { benchmark }
```

```js
// main.js
const { benchmark } = require('./benchmark')

console.log('=== O(1): Constant Time ===')
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== O(1): Constant Time ===
```

**In the terminal, confirm the timer works:**

```bash
node -e "const start = process.hrtime.bigint(); for(let i=0;i<1e6;i++){}; console.log(Number(process.hrtime.bigint()-start)/1e6, 'ms')"
```

**Expected:** A small positive number of milliseconds — confirms `process.hrtime.bigint()` measures elapsed time correctly.

---

## Step 2 — O(1): Constant Time

```js
function accessByIndex(arr, index) {
  return arr[index]    // ← add: array indexing is a direct memory-address calculation — always one step
}
```

Add to `main.js`:

```js
const small = new Array(1000).fill(0).map((_, i) => i)
const large = new Array(1_000_000).fill(0).map((_, i) => i)

benchmark('array[500000] at size 1000   ', () => accessByIndex(small, 500))
benchmark('array[500000] at size 1000000', () => accessByIndex(large, 500000))
console.log('  ← same cost regardless of array size')
```

### SAVE AND TRY

```bash
node main.js
```

**Expected (your exact numbers will vary, but both should be near-instant and roughly equal):**
```
array[500000] at size 1000   : 0.001ms
array[500000] at size 1000000: 0.001ms
  ← same cost regardless of array size
```

**Why this is O(1):** `arr[index]` doesn't search — it computes a memory address directly (`base address + index * element size`) and reads it. Whether the array has 1,000 or 1,000,000,000 elements, that computation takes the exact same number of steps. This is also why LAB-04's `HashMap.get(key)` is O(1) — it computes `hash(key) % bucketCount` to jump directly to the right bucket, instead of searching.

**Change something:** Try `accessByIndex(large, 999999)` (the very last index) vs `accessByIndex(large, 0)` (the first). Confirm they take the same time — position within the array doesn't matter for O(1) access, only for algorithms that must SEARCH for something.

---

## Step 3 — O(n): Linear Time

```js
function sum(arr) {
  let total = 0
  for (const x of arr) {           // ← add: one operation per element — no skipping, no shortcuts
    total += x
  }
  return total
}
```

Add to `main.js`:

```js
console.log('\n=== O(n): Linear Time ===')

const arr1k = new Array(1_000).fill(1)
const arr10k = new Array(10_000).fill(1)
const arr100k = new Array(100_000).fill(1)

benchmark('sum of 1000 items  ', () => sum(arr1k))
benchmark('sum of 10000 items ', () => sum(arr10k))
benchmark('sum of 100000 items', () => sum(arr100k))
console.log('  ← roughly 10x input = roughly 10x time')
```

### SAVE AND TRY

```bash
node main.js
```

**Expected shape (exact numbers vary by machine):**
```
sum of 1000 items  : 0.021ms
sum of 10000 items : 0.198ms
sum of 100000 items: 1.847ms
  ← roughly 10x input = roughly 10x time
```

**Confirm the ratio, not the exact numbers:** `10000 / 1000 = 10`. Compare the timing ratio: `0.198 / 0.021 ≈ 9.4` — close to 10. This rough proportionality (double the input, roughly double the time) is the signature of O(n). It will never be EXACTLY proportional due to system noise (other processes, CPU cache effects), but the trend holds.

**Change something:** Run the 100,000-item benchmark 3 times in a row (call `sum(arr100k)` three times). The times should stay roughly similar to each other — same input size, same algorithm, similar cost every time. This consistency is what lets you trust the measurement.

---

### Concept: O(n²) — Quadratic Time, and How It Sneaks In

**What it is:** O(n²) means the cost grows with the SQUARE of the input — double the input, QUADRUPLE the time. The most common cause: a loop nested inside another loop, where the inner loop also depends on `n`.

**The problem before:** The most natural way to check "does this array contain any duplicate values?" is: for every element, compare it against every OTHER element.

```js
function hasDuplicatesNaive(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {   // nested loop — runs n times FOR EACH of the n outer iterations
      if (i !== j && arr[i] === arr[j]) return true
    }
  }
  return false
}
```

For `n` elements, the inner loop runs `n` times, and it does so for EACH of the `n` outer iterations — `n * n = n²` total comparisons. For 1,000 items, that's 1,000,000 comparisons. For 2,000 items, that's 4,000,000 — quadrupled, not doubled, from only doubling the input.

**The solution:** LAB-04 already gave you the fix — a hash set gives O(1) membership checks. Instead of comparing against every other element, check whether you've SEEN this value before, using O(1) lookups:

```js
function hasDuplicatesFast(arr) {
  const seen = new Set()             // hash set — O(1) average add and lookup, from LAB-04's HashMap concept
  for (const x of arr) {
    if (seen.has(x)) return true     // O(1) check, not an O(n) inner loop
    seen.add(x)
  }
  return false
}
```

**Project Application (The "Why" here):** This is the single most common real-world performance bug: nested loops over the same data, where a hash map/set would replace the inner loop with an O(1) lookup. The problem doesn't change. The ANSWER doesn't change. Only the data structure changes, and the complexity class drops from O(n²) to O(n).

**Watch for:** `arr.includes(x)` inside a loop is a hidden O(n²) — `.includes()` is itself O(n) (it scans the array), so calling it once per element in a loop is `n` calls of an `n`-cost operation, sneaking in as `Array.prototype.includes` calls that don't LOOK like a nested loop but cost the same as one.

---

## Step 4 — O(n²) vs the O(n) Fix

```js
function hasDuplicatesNaive(arr) {
  for (let i = 0; i < arr.length; i++) {           // ← add
    for (let j = 0; j < arr.length; j++) {          // ← add: nested — this is what makes it O(n²)
      if (i !== j && arr[i] === arr[j]) return true
    }
  }
  return false
}

function hasDuplicatesFast(arr) {
  const seen = new Set()                            // ← add
  for (const x of arr) {                            // ← add
    if (seen.has(x)) return true                    // ← add: O(1), not a nested loop
    seen.add(x)
  }
  return false
}

function randomArrayNoDuplicates(size) {              // helper: guarantees the worst case (no early exit)
  return new Array(size).fill(0).map((_, i) => i)
}
```

Add to `main.js`:

```js
console.log('\n=== O(n²): Quadratic Time ===')

const dup1k = randomArrayNoDuplicates(1000)
const dup2k = randomArrayNoDuplicates(2000)

benchmark('duplicates (naive) in 1000 items', () => hasDuplicatesNaive(dup1k))
benchmark('duplicates (naive) in 2000 items', () => hasDuplicatesNaive(dup2k))
console.log('  ← 2x input = roughly 4x time (2² = 4)')

console.log('\n=== O(n) fix using a Hash Set ===')
benchmark('duplicates (hash set) in 1000 items', () => hasDuplicatesFast(dup1k))
benchmark('duplicates (hash set) in 2000 items', () => hasDuplicatesFast(dup2k))
console.log('  ← same problem, same answer, radically different growth')
```

### SAVE AND TRY

```bash
node main.js
```

**Expected shape:**
```
=== O(n²): Quadratic Time ===
duplicates (naive) in 1000 items: 3.412ms
duplicates (naive) in 2000 items: 13.777ms
  ← 2x input = roughly 4x time (2² = 4)

=== O(n) fix using a Hash Set ===
duplicates (hash set) in 1000 items: 0.089ms
duplicates (hash set) in 2000 items: 0.161ms
  ← same problem, same answer, radically different growth
```

**Confirm the quadratic ratio:** `13.777 / 3.412 ≈ 4.0` — doubling the input roughly QUADRUPLED the time, the signature of O(n²). Compare to the hash-set version: `0.161 / 0.089 ≈ 1.8` — close to the expected 2x for O(n).

**Change something:** Try `randomArrayNoDuplicates(4000)` with the naive version. Predict the time relative to the 2000-item run using the `n²` rule (`4000/2000 = 2`, so time should roughly `4x`) before running.

---

### Concept: O(log n) — Logarithmic Time

**What it is:** O(log n) means every step of the algorithm ELIMINATES A FRACTION (usually half) of the remaining problem. The number of steps needed grows incredibly slowly as `n` grows — doubling `n` adds only ONE more step, not double the steps.

**The problem before:** Searching an unsorted array requires checking every element in the worst case — O(n). Even for a SORTED array, a naive linear scan still checks every element, wasting the fact that it's sorted.

**The solution:** Binary search — exactly the same idea as LAB-06's binary-search-tree `contains()`. Check the middle element. If the target is smaller, you now KNOW it can only be in the left half — discard the right half entirely without looking at it. Repeat.

**Canonical example (General Explanation):**

Think of looking up a name in a phone book (or guessing a number between 1 and 1000 when told only "higher" or "lower"). You don't start at page 1 — you open to the middle, see which half your target is in, and repeat on that half only. Each guess eliminates HALF of what remains. `1000 → 500 → 250 → 125 → 63 → 32 → 16 → 8 → 4 → 2 → 1` — only about 10 guesses to narrow 1,000 possibilities down to 1.

```js
function binarySearch(sortedArr, target) {
  let low = 0
  let high = sortedArr.length - 1
  let comparisons = 0

  while (low <= high) {
    comparisons++
    const mid = Math.floor((low + high) / 2)
    if (sortedArr[mid] === target) return { found: true, comparisons }
    if (sortedArr[mid] < target) low = mid + 1     // target is in the right half — discard the left
    else high = mid - 1                             // target is in the left half — discard the right
  }
  return { found: false, comparisons }
}
```

**Project Application (The "Why" here):** This is exactly LAB-06's binary-search-tree `contains()`, generalized to a flat sorted array instead of a tree of nodes — same halving idea, same O(log n) guarantee, same requirement (the data must be sorted/ordered for this trick to work at all).

**Watch for:** `Math.log2(n)` tells you roughly how many steps binary search needs. For `n = 1,000,000`: `Math.log2(1_000_000) ≈ 20`. That is the entire reason O(log n) algorithms are considered "fast" even for enormous inputs — the step count barely grows.

---

## Step 5 — Binary Search vs Linear Search

```js
function binarySearch(sortedArr, target) {
  let low = 0
  let high = sortedArr.length - 1
  let comparisons = 0                                     // ← add: count steps, not just time

  while (low <= high) {
    comparisons++                                          // ← add
    const mid = Math.floor((low + high) / 2)                // ← add
    if (sortedArr[mid] === target) return { found: true, comparisons }
    if (sortedArr[mid] < target) low = mid + 1               // ← add: discard left half
    else high = mid - 1                                       // ← add: discard right half
  }
  return { found: false, comparisons }
}

function linearSearch(arr, target) {
  let comparisons = 0
  for (let i = 0; i < arr.length; i++) {                    // ← add
    comparisons++
    if (arr[i] === target) return { found: true, comparisons }
  }
  return { found: false, comparisons }
}
```

Add to `main.js`:

```js
console.log('\n=== O(log n): Binary Search ===')

const sorted = new Array(1_000_000).fill(0).map((_, i) => i)   // already sorted: 0, 1, 2, ..., 999999
const target = 743891

const binResult = binarySearch(sorted, target)
console.log(`found ${target} in sorted array of 1000000 after ${binResult.comparisons} comparisons`)

const linResult = linearSearch(sorted, target)
console.log(`linear search for same value took ${linResult.comparisons} comparisons`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== O(log n): Binary Search ===
found 743891 in sorted array of 1000000 after 20 comparisons
linear search for same value took 743892 comparisons
```

**The gap made concrete:** Binary search needed 20 comparisons. Linear search needed 743,892 — over 37,000 times more work, to find the exact same value in the exact same array. This is the practical meaning of "O(log n) vs O(n)" — not a small optimization, a fundamentally different growth curve.

**Change something:** Search for `0` (the first element) and `999999` (the last element) with `linearSearch`. Confirm the comparison counts are wildly different (`1` vs `1,000,000`) for linear search, while `binarySearch` stays close to 20 for any target — that stability regardless of WHERE the target is located is the point.

---

## 🎯 Challenge: O(n log n) — Merge Sort vs O(n²) — Bubble Sort

**You know:** Nested loops over the same data are O(n²). Halving the problem repeatedly is O(log n).

**Task:** Implement bubble sort (compare adjacent pairs, swap if out of order, repeat until no swaps needed — an O(n²) algorithm) and merge sort (split the array in half recursively until pieces have 1 element, then merge sorted pieces back together — an O(n log n) algorithm, combining LAB-07's branching recursion with linear merging). Benchmark both on the same 2,000-item array.

**Starting code:**

```js
function bubbleSort(arr) {
  const a = [...arr]                          // copy — don't mutate the input
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      // TODO: if a[j] > a[j+1], swap them
    }
  }
  return a
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr             // base case — an array of 0 or 1 is already sorted
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))   // recurse on the left half
  const right = mergeSort(arr.slice(mid))     // recurse on the right half
  // TODO: merge the two sorted halves into one sorted array
}
```

**Hint:** Merging two sorted arrays takes one linear pass: keep two pointers, always take the smaller front element from either array, advance that pointer.

<details>
<summary>▶ Show Solution</summary>

```js
function bubbleSort(arr) {
  const a = [...arr]
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]]    // swap using array destructuring
      }
    }
  }
  return a
}

function merge(left, right) {
  const result = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++])   // take the smaller front element
    else result.push(right[j++])
  }
  return [...result, ...left.slice(i), ...right.slice(j)]   // append whatever's left over
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  return merge(left, right)
}
```

**Key insight:** Merge sort does `log n` levels of splitting (halving repeatedly, just like binary search), and at EACH level, merging all the pieces back together costs O(n) total work — `n` items merged, across however many pieces exist at that level. `log n` levels × `n` work per level = O(n log n) total. This is dramatically better than bubble sort's O(n²) for large inputs, at the cost of using extra memory for the merged arrays (a space-time trade-off — see the Concept box below).

</details>

Add to `main.js`:

```js
console.log('\n=== O(n log n): Merge Sort vs O(n²): Bubble Sort ===')

const unsorted = new Array(2000).fill(0).map(() => Math.floor(Math.random() * 10000))

benchmark('bubble sort 2000 items', () => bubbleSort(unsorted))
benchmark('merge sort 2000 items ', () => mergeSort(unsorted))
```

### SAVE AND TRY

**Expected shape:**
```
=== O(n log n): Merge Sort vs O(n²): Bubble Sort ===
bubble sort 2000 items: 47.223ms
merge sort 2000 items: 0.892ms
```

Merge sort should be dramatically faster — this is the same 2,000-item input, sorted correctly by both, with a completely different growth curve behind the two answers.

---

### Concept: Space Complexity and the Space-Time Trade-off

**What it is:** Time complexity measures how many OPERATIONS grow with input size. **Space complexity** measures how much EXTRA MEMORY grows with input size. Often, you can trade one for the other: use more memory to save time, or use less memory at the cost of more time.

**Canonical example (General Explanation):**

- `hasDuplicatesFast` (Step 4) is O(n) time, but ALSO O(n) space — the `Set` can grow to hold every element. `hasDuplicatesNaive` is O(n²) time but O(1) EXTRA space — it uses no additional data structure beyond the input array itself.
- LAB-02's memoized `fib` traded O(n) space (the cache dictionary) to bring time down from O(2ⁿ) to O(n) — an enormous time win for a modest, linear space cost.
- Merge sort's O(n log n) time comes at the cost of O(n) extra space for the merged arrays at each level — unlike an in-place O(n²) sort that needs no extra array.

**Project Application (The "Why" here):** "Is this fast?" is an incomplete question. The real question is "fast in TIME, fast in SPACE, or both — and which one can I afford to spend?" A phone with limited memory might prefer the O(1)-space, slower sort. A server with abundant RAM and demanding latency requirements will almost always trade space for time.

**Where you will see this again:**
- LAB-53 (File Indexing Engine) and LAB-54 (Search Engine) — an inverted index trades significant memory for near-instant search
- LAB-65 (Caching Layer) — the entire concept of caching IS the space-time trade-off, made explicit
- LAB-75 (Spatial Partitioning) — quadtrees trade memory for faster collision queries, generalizing this lab's binary search to two dimensions

---

## Step 6 — Confirm LAB-02's Fibonacci Complexity Directly

```js
let naiveCalls = 0
function fibNaive(n) {
  naiveCalls++
  if (n <= 1) return n
  return fibNaive(n - 1) + fibNaive(n - 2)     // branching recursion — O(2ⁿ), from LAB-07's Concept box
}

let memoCalls = 0
function makeFibMemo() {
  const cache = {}
  function fib(n) {
    memoCalls++
    if (n in cache) return cache[n]
    const result = n <= 1 ? n : fib(n - 1) + fib(n - 2)
    cache[n] = result
    return result
  }
  return fib
}
```

Add to `main.js`:

```js
console.log('\n=== O(2^n): Exponential Time ===')

naiveCalls = 0
const naiveTime = benchmark(`naive fib(28)`, () => fibNaive(28))

memoCalls = 0
const fibMemo = makeFibMemo()
const memoTime = benchmark(`memoized fib(28)`, () => fibMemo(28))

console.log(`naive fib(28): ${naiveTime.toFixed(3)}ms (${fibNaive(28)}, ${naiveCalls} calls)`)
console.log(`memoized fib(28): ${memoTime.toFixed(3)}ms (${fibMemo(28)}, ${memoCalls} calls)`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected shape:**
```
=== O(2^n): Exponential Time ===
naive fib(28): 3.128ms (317811, 832039 calls)
memoized fib(28): 0.019ms (317811, 28 calls)
```

Both compute the identical correct answer (`317811`). The naive version makes over 800,000 recursive calls; the memoized version makes 28 — one per unique input, exactly as promised in LAB-02. `fib(28)` is still small enough for naive recursion to finish in milliseconds — try changing it to `fibNaive(38)` and you'll feel O(2ⁿ) directly: each `+1` to `n` roughly DOUBLES the time, because the call tree from LAB-07's Tower of Hanoi challenge (`2^(n+1) - 1` calls) is exactly this same branching shape.

---

## Final Check

| Feature | How to verify |
|---|---|
| O(1) array access shows equal cost at 1,000 vs 1,000,000 elements | Step 2 |
| O(n) sum shows roughly proportional growth (10x input ≈ 10x time) | Step 3 |
| O(n²) naive duplicate check shows roughly 4x time for 2x input | Step 4 |
| Hash-set duplicate check is dramatically faster for the same input/output | Step 4 |
| Binary search needs ~20 comparisons; linear search needs up to 1,000,000 | Step 5 |
| Merge sort is dramatically faster than bubble sort at 2,000 items | Challenge |
| Naive fib(28) makes ~800K+ calls; memoized fib(28) makes exactly 28 | Step 6 |
| You can name the complexity class of any function in this lab without looking | O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ) |
| You can explain the space-time trade-off with an example from your OWN code | Not just this lab's examples |

---

## Quick Check Answers

**1. 1ms for 10 items, 100ms for 1,000 items (100x input, 100x time) — what complexity class?**

That's O(n) — linear. The input grew by a factor of 100, and the time grew by the same factor of 100. This is the defining signature of linear growth: cost scales proportionally with input size. (If it had been quadratic, 100x the input would have meant roughly 10,000x the time, not 100x.)

**2. Binary search: ~20 comparisons for 1,000,000 items. Linear search: up to 1,000,000. What's this gap called?**

The gap between O(log n) and O(n). `log₂(1,000,000) ≈ 20`, confirmed directly in Step 5's output. The practical meaning: doubling the array size adds roughly ONE more comparison to binary search's cost, but doubles linear search's worst-case cost. As `n` grows toward billions, this gap becomes the difference between "instant" and "unusable," even though both algorithms are simple to write.

**3. A function that always takes exactly 500ms regardless of input size — slow or fast in Big-O terms?**

It's O(1) — constant time — which is the BEST possible complexity class, even though 500ms sounds slow in absolute terms. Big-O describes GROWTH, not absolute speed. An O(1) function that takes 500ms will still take 500ms at any input size, including inputs far larger than an O(n) or O(n²) function could ever handle in that same 500ms. Whether 500ms is "acceptable" is a separate, real-world question that Big-O notation deliberately does not answer — that's the "what it ignores" half of this lab's opening Concept box.

---

*Next: [LAB-09 — Calculator](../module-02-mini-projects/LAB-09-calculator.md) — JavaScript, Module 2 begins*
