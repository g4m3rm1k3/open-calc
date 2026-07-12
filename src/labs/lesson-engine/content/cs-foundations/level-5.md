---
series: cs-foundations
level: 5
title: Complexity — How Fast Is Your Code?
lang: javascript
---

# Complexity — How Fast Is Your Code?

You have written functions that loop over arrays, search for values, and sort items. All of them "work." But "works" is not a complete description of a function — two functions that produce the same output can have radically different performance as inputs grow. One might take a millisecond for 1,000 items and a second for 1,000,000 items. Another might take 1 millisecond for 1,000 items and 1,000 seconds for 1,000,000 items.

**Big O notation** is the mathematical vocabulary for describing how the time or memory a function requires grows as its input grows. It is not about the specific time on a specific machine — it is about the growth rate. Understanding Big O is what allows you to look at a function and know whether it will perform acceptably at scale before running it.

By the end of this lesson you will be able to read and write Big O notation, classify the common complexity classes, identify the complexity of loops and recursion, and use this knowledge to make concrete decisions about which algorithm to use.

## What Big O measures

Big O describes the worst-case growth rate of time or memory as a function of input size `n`.

```text
The question Big O answers:
  "If I double the input size, what happens to the time?"

  O(1)   — constant:   doubling input → same time. (Array index lookup.)
  O(log n) — logarithmic: doubling input → one extra step. (Binary search.)
  O(n)   — linear:    doubling input → double the time. (Linear scan.)
  O(n log n) — linearithmic: doubling → slightly more than double. (Good sort.)
  O(n²)  — quadratic: doubling input → 4× the time. (Nested loop over same array.)
  O(2ⁿ)  — exponential: adding one item → double the time. (Brute-force subsets.)

Example: n = 1,000,000 operations at 10⁹ operations/second:
  O(1)       → 0.000001 ms   (instantly)
  O(log n)   → 0.00002  ms   (instantly)
  O(n)       → 1 ms          (fast)
  O(n log n) → 20 ms         (fast)
  O(n²)      → 1,000,000 ms  = 17 minutes  (too slow)
  O(2ⁿ)      → longer than the age of the universe
```

```text
Big O rules:
  1. Drop constants: O(3n) → O(n). Constants are absorbed by the notation.
     "3 operations per element" and "1 operation per element" have the same growth rate.
  2. Drop lower-order terms: O(n² + n) → O(n²). For large n, n² dominates n.
  3. Worst case (unless stated otherwise): O(n) for search means the item may be at the end.
  4. n is the input size: elements in an array, characters in a string, nodes in a graph.
```

## Recognising complexity from code

The structure of the code tells you the complexity before running it.

**Single loop → O(n):**

```javascript
function sumArray(numbers) {
  let total = 0
  for (const n of numbers) {   // executes once per element → n iterations
    total += n
  }
  return total
}
// One pass through the array. Doubling the array doubles the work. O(n).
```

**Nested loops over the same array → O(n²):**

```javascript
function hasDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {         // outer: n iterations
    for (let j = i + 1; j < arr.length; j++) {   // inner: ~n iterations per outer
      if (arr[i] === arr[j]) return true
    }
  }
  return false
}
// For each of the n elements, we check ~n others. n × n = n² comparisons.
// O(n²): doubling the array quadruples the comparisons.
```

```text
hasDuplicate([1, 2, 3, 4]):
  i=0: compare 1 with 2, 3, 4  (3 comparisons)
  i=1: compare 2 with 3, 4     (2 comparisons)
  i=2: compare 3 with 4        (1 comparison)
  Total: 6 comparisons for n=4

  For n=8: 28 comparisons. For n=16: 120. For n=1000: ~500,000.
  O(n²) is unusable for large n.

Better approach: use a Set (O(n) lookup → O(n) total):
  function hasDuplicate(arr) {
    const seen = new Set()
    for (const x of arr) {
      if (seen.has(x)) return true   // O(1) per check
      seen.add(x)                     // O(1) per add
    }
    return false
  }
  // n elements × O(1) per element = O(n). Doubling input doubles time (not quadruples).
```

**Dividing in half each step → O(log n):**

```javascript
function binarySearch(sortedArr, target) {
  let left = 0
  let right = sortedArr.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (sortedArr[mid] === target) return mid
    if (sortedArr[mid] < target) left  = mid + 1
    else                         right = mid - 1
  }
  return -1
}
// Each iteration halves the search space.
// For n=1000:   ~10 iterations (log₂ 1000 ≈ 10).
// For n=1000000: ~20 iterations (log₂ 1,000,000 ≈ 20).
// Doubling n adds ONE iteration. O(log n).
```

```text
Binary search trace on [1, 3, 5, 7, 9, 11, 13], target = 9:

  left=0, right=6: mid=3 → arr[3]=7. 7 < 9 → left = 4
  left=4, right=6: mid=5 → arr[5]=11. 11 > 9 → right = 4
  left=4, right=4: mid=4 → arr[4]=9. Found! → return 4

  3 steps for n=7. Linear search would take up to 7 steps.
  For n=1,000,000: binary search takes ~20 steps. Linear: up to 1,000,000.
```

**CS lens:** Binary search's O(log n) complexity comes from the mathematical property: log₂ n is the number of times you can halve n before reaching 1. This is why log appears whenever the algorithm divides the search space in half at each step. The same pattern appears in balanced binary trees (O(log n) insertion, search, deletion), heap operations (O(log n)), and merge sort's "divide-and-conquer" phase. O(log n) algorithms feel nearly constant in practice because log₂(10⁹) ≈ 30 — even with a billion items, you need at most 30 steps.

## Space complexity

Time is not the only resource. Memory (space) has its own complexity, using the same notation.

```javascript
// O(1) space: a constant amount of extra memory regardless of input size
function sum(arr) {
  let total = 0   // one variable — does not grow with arr.length
  for (const n of arr) total += n
  return total
}

// O(n) space: memory grows linearly with input
function doubled(arr) {
  return arr.map(x => x * 2)   // creates a new array of length n
}

// O(1) space alternative: modify in place (if allowed by the contract)
function doubleInPlace(arr) {
  for (let i = 0; i < arr.length; i++) arr[i] *= 2   // no extra array
}
```

```text
Space complexity matters when:
  — Memory is limited (mobile devices, edge servers, embedded systems).
  — The function is called in a tight loop — O(n) space per call = O(n²) total.
  — Large inputs: O(n²) space for n=1,000,000 is 10¹² bytes = 1 terabyte.

The time-space tradeoff:
  Often you can trade memory for time: store intermediate results (O(n) space) to avoid
  recomputing them (O(n²) time). This is called memoisation (covered in DSA lessons).
```

**SE lens:** In production systems, Big O is the first-pass correctness check for algorithms before measuring. If an algorithm is O(n²) and n can be 100,000, it will take 10 billion operations — no hardware optimisation will make it fast enough. Fix the algorithm, not the machine. Profiling (measuring actual performance) comes after — to find constant factors, cache behaviour, and real bottlenecks that theory cannot predict.

**Common mistakes:**
- Assuming O(n) is always fast and O(n²) is always slow — it depends on n. For n=10, O(n²) is 100 operations. For n=100,000, O(n²) is 10 billion. The threshold where O(n²) becomes unacceptable is around n=10,000 for time-sensitive operations.
- Ignoring space complexity — an O(n) algorithm that uses O(n²) space is unusable for large n even if it is fast.
- Confusing average and worst case — hash tables are O(1) average but O(n) worst case. Quick sort is O(n log n) average but O(n²) worst case. Context determines which matters.

**Debug tip:** When a function is unexpectedly slow, count the loops: one loop is O(n), two nested loops over the same data is O(n²). Adding a `counter` variable that increments inside the innermost loop and logging it tells you the actual number of operations — compare to what the Big O predicts.

## Challenge: classify_complexity

Classify the complexity of each function and explain why.

```challenge
function findMax(arr) {
  let max = arr[0]
  for (const n of arr) if (n > max) max = n
  return max
}

function pairSums(arr) {
  const sums = []
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      sums.push(arr[i] + arr[j])
    }
  }
  return sums
}

function countUnique(arr) {
  return new Set(arr).size
}

const complexityAnalysis = {
  findMax_time:       '',   // 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', or 'O(n^2)'
  findMax_why:        '',
  pairSums_time:      '',
  pairSums_why:       '',
  countUnique_time:   '',
  countUnique_why:    '',
  // If arr has 1000 elements, how many operations does pairSums do?
  pairSums_ops_n1000: 0,
}
```

```test
const c = complexityAnalysis
assert c.findMax_time === 'O(n)'
assert c.findMax_why.length > 10
assert c.pairSums_time === 'O(n^2)' || c.pairSums_time === 'O(n²)'
assert c.pairSums_why.toLowerCase().includes('nested') || c.pairSums_why.toLowerCase().includes('loop')
assert c.countUnique_time === 'O(n)'
assert c.pairSums_ops_n1000 === 1000000
```
