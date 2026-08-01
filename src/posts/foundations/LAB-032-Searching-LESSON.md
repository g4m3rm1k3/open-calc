# FOUNDATIONS — LAB-032 — Searching: Linear and Binary Search

**Series:** FOUNDATIONS — Part VI: Algorithms
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 40–55 minutes.

---

## What You Will Build

Linear search (O(n) baseline), binary search on a sorted array (O(log n)), and a worked example of the sort-once-search-many tradeoff. After this lab you will be able to calculate how many steps binary search needs for any array size, and explain precisely when the sort cost is worth paying.

---

## What You Need to Know First

**From LAB-031 (Sorting):** Binary search requires a sorted array. Sorting is O(n log n). If you sort once and search many times, the sort cost is amortized over all searches.

**From LAB-005 (Big-O):** O(log n) halves the search space on each step. For a million elements, that is at most 20 steps.

---

> **Quick Check — try to answer before reading:**
>
> 1. An array of 1,024 elements. How many steps does binary search need in the worst case?
> 2. If you need to search an array exactly once, is it worth sorting first?
> 3. Binary search works on sorted arrays. What happens if the array is not sorted?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Linear Search: The Baseline

**The code:**

```js
function linearSearch(array, target) {
  for (let index = 0; index < array.length; index++) {
    if (array[index] === target) return index;   // found at this index
  }
  return -1;   // not found — convention: -1 means absence
}
```

**The walkthrough:** On `[3, 7, 1, 9, 4]`, searching for 9:
- index 0: 3 ≠ 9. index 1: 7 ≠ 9. index 2: 1 ≠ 9. index 3: 9 === 9 → return 3.

On searching for 5: all five elements examined, return -1.

**The CS lens — O(n):** In the worst case (not found, or found at the last position) every element is examined. Work scales linearly with n. No sorting required — linear search works on any array in any order.

**The SE lens — return convention:** Returning -1 for "not found" is a convention inherited from C. It avoids returning `null` (which requires a null check at every call site) or throwing an exception (which conflates "not found" with "error"). The convention is widely understood. In TypeScript, you would type the return as `number | -1` or use an `Option` type to make absence explicit.

---

### Step 2 — Binary Search

**The problem this step solves:** Search a sorted array in O(log n) by exploiting the ordering property: if the middle element is too small, the target must be in the right half; if too large, the target must be in the left half.

**The code:**

```js
function binarySearch(sortedArray, target) {
  let lowBound  = 0;
  let highBound = sortedArray.length - 1;

  while (lowBound <= highBound) {
    const middleIndex = Math.floor((lowBound + highBound) / 2);
    const middleValue = sortedArray[middleIndex];

    if (middleValue === target) {
      return middleIndex;            // found
    } else if (middleValue < target) {
      lowBound = middleIndex + 1;   // target is in right half
    } else {
      highBound = middleIndex - 1;  // target is in left half
    }
  }

  return -1;   // not found
}
```

**The walkthrough — searching for 7 in `[1, 3, 5, 7, 9, 11, 13]` (indices 0–6):**

**Iteration 1:** low=0, high=6. mid = floor(3) = 3. `array[3]` = 7 === 7. **Found at index 3.**

**Searching for 11:**

**Iteration 1:** low=0, high=6. mid=3. `array[3]`=7 < 11. → low=4.
**Iteration 2:** low=4, high=6. mid=5. `array[5]`=11 === 11. **Found at index 5.**

**Searching for 6 (not in array):**

**Iteration 1:** low=0, high=6. mid=3. array[3]=7 > 6 → high=2.
**Iteration 2:** low=0, high=2. mid=1. array[1]=3 < 6 → low=2.
**Iteration 3:** low=2, high=2. mid=2. array[2]=5 < 6 → low=3.
**Iteration 4:** low=3 > high=2. Loop exits. Return -1.

**The CS lens — search space halving:** Each iteration either finds the target or eliminates half the remaining candidates. Starting with n candidates, after 1 step: n/2. After 2: n/4. After k: n/2^k. The search ends when n/2^k ≤ 1, i.e., k = log₂(n). This is the proof that binary search is O(log n).

**The off-by-one trap — `lowBound <= highBound` not `<`:** If the loop used `<`, it would exit when `low === high` — before examining the last remaining candidate. The `<=` ensures that when exactly one candidate remains (low === high), it is checked. This is the most common binary search bug.

**The integer overflow trap (historical):** `(low + high) / 2` can overflow in languages with fixed-size integers if low and high are both large (e.g., near `INT_MAX` in C or Java). The safe calculation is `low + Math.floor((high - low) / 2)`. JavaScript uses 64-bit floats that can represent integers up to 2^53, making this a non-issue in practice, but knowing the historical bug matters when writing in C/Java.

---

### Step 3 — The Sort-Once-Search-Many Tradeoff

**The problem this step solves:** When does it pay to sort before searching?

**One search:** Sorting costs O(n log n). One linear search costs O(n). If you only search once, linear search wins — O(n) < O(n log n).

**Many searches:** Sorting costs O(n log n) once. Each binary search costs O(log n). After k searches, total cost with sorting is O(n log n + k log n). Total cost without sorting is O(k × n). Sorting pays off when `k log n > n log n`, i.e., `k > n`. Once you plan to search more times than the array has elements, sorting first is faster.

```js
function demonstrateTradeoff(arraySize, searchCount) {
  const unsortedArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 1000));
  const targetValue = Math.floor(Math.random() * 1000);

  // Strategy 1: Linear search every time
  let linearStart = performance.now();
  for (let count = 0; count < searchCount; count++) {
    linearSearch(unsortedArray, targetValue);
  }
  const linearTime = performance.now() - linearStart;

  // Strategy 2: Sort once, binary search every time
  let binaryStart = performance.now();
  const sortedArray = [...unsortedArray].sort((a, b) => a - b);
  for (let count = 0; count < searchCount; count++) {
    binarySearch(sortedArray, targetValue);
  }
  const binaryTime = performance.now() - binaryStart;

  console.log(`${arraySize} elements, ${searchCount} searches:`);
  console.log(`  Linear:          ${linearTime.toFixed(2)}ms`);
  console.log(`  Sort + Binary:   ${binaryTime.toFixed(2)}ms`);
}

demonstrateTradeoff(10000, 100);    // linear wins (search count < array size)
demonstrateTradeoff(10000, 10000);  // roughly equal
demonstrateTradeoff(10000, 100000); // binary wins (many searches)
```

**The SE lens — the tradeoff is a design decision:** This is the recurring engineering pattern: pay a one-time cost (sorting) to get cheaper operations later (O(log n) searches). Databases use this: the B-tree index is expensive to build and maintain, but queries that use it are O(log n) instead of O(n). The decision to index a column is exactly this tradeoff made explicit.

---

### Step 4 — Recursive Binary Search

The iterative version above is more memory-efficient. The recursive version is closer to the mathematical definition and easier to reason about correctness:

```js
function binarySearchRecursive(sortedArray, target, lowBound = 0, highBound = sortedArray.length - 1) {
  if (lowBound > highBound) return -1;   // base case: not found

  const middleIndex = Math.floor((lowBound + highBound) / 2);
  const middleValue = sortedArray[middleIndex];

  if (middleValue === target) return middleIndex;
  if (middleValue < target)  return binarySearchRecursive(sortedArray, target, middleIndex + 1, highBound);
  return binarySearchRecursive(sortedArray, target, lowBound, middleIndex - 1);
}
```

The recursive and iterative versions produce identical results. The recursive version uses O(log n) call stack space; the iterative version uses O(1). For an array of a million elements, that is ~20 stack frames — not a concern in practice. For ten million, still only ~23 frames.

---

## Connect the Pieces

- **`Array.prototype.indexOf`** is linear search — O(n). Use it when the array is small or unsorted.
- **Database indexes** (LAB-115) are B-trees — generalized binary search structures. A query `WHERE age = 30` on an indexed column is O(log n). Without the index, it is O(n).
- **Git bisect** is binary search applied to commit history. If a bug was introduced somewhere in 1,000 commits, `git bisect` checks 10 commits to find it.
- **Dictionary lookup in a spell checker** uses a sorted word list and binary search. The same technique underlies IP routing tables — binary search on sorted CIDR ranges.

---

## What Breaks Without This

**Searching an unsorted array with binary search:**

```js
const wrongArray = [9, 1, 7, 3, 5];  // not sorted
binarySearch(wrongArray, 7);  // likely returns -1 even though 7 is there
```

Iteration 1: mid=2. array[2]=7 === 7. Returns 2. Got lucky this time.

But `binarySearch([9, 1, 7, 3, 5], 3)`:
Iteration 1: mid=2. array[2]=7 > 3 → high=1.
Iteration 2: mid=0. array[0]=9 > 3 → high=-1.
Returns -1. But 3 IS in the array at index 3. **Wrong answer.**

Binary search's correctness depends absolutely on the sorted precondition. Violating it produces wrong results without any error. This is a silent bug — one of the most dangerous kinds.

---

## Definition of Done

- [ ] `linearSearch([3,7,1,9,4], 9)` returns `3`
- [ ] `linearSearch([3,7,1,9,4], 5)` returns `-1`
- [ ] `binarySearch([1,3,5,7,9,11,13], 7)` returns `3`
- [ ] `binarySearch([1,3,5,7,9,11,13], 6)` returns `-1`
- [ ] `binarySearch([7], 7)` returns `0` (single-element array)
- [ ] `binarySearch([], 7)` returns `-1` (empty array)
- [ ] You can calculate: how many steps does binary search need for an array of 1,048,576 elements?

**Git commit:**

```
git add src/
git commit -m "LAB-032: linear search O(n) and binary search O(log n) — sort-once-search-many tradeoff quantified; binary search correctness requires sorted precondition"
```

---

## Quick Check Answers

1. **10 steps.** 1024 = 2^10. log₂(1024) = 10. Each step halves the search space: 1024 → 512 → 256 → 128 → 64 → 32 → 16 → 8 → 4 → 2 → 1.
2. **No.** One search costs O(n) with linear search. Sorting costs O(n log n), which is *more* work for a single search. You would sort and then binary search in O(n log n + log n) = O(n log n) — worse than just O(n) linear search.
3. **Binary search produces wrong answers silently.** There is no error thrown. The algorithm follows incorrect elimination steps and may return -1 for a value that exists, or a wrong index. The sorted precondition is not optional.
