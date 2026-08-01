# FOUNDATIONS — LAB-031 — Sorting Algorithms

**Series:** FOUNDATIONS — Part VI: Algorithms
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 60–75 minutes.

---

## What You Will Build

Bubble sort (to see the O(n²) problem concretely), merge sort (to understand why divide-and-conquer achieves O(n log n)), and the proof of why no comparison-based sort can do better. After this lab you will understand why JavaScript's built-in `Array.prototype.sort` is O(n log n), what "stable sort" means, and when to use a non-comparison sort.

---

## What You Need to Know First

**From LAB-008 (Recursion):** Merge sort is recursive. Dividing an array in half and sorting each half independently is the recursive step. Merging is the combine step.

**From LAB-005 (Big-O):** O(n²) means double the input → four times the work. O(n log n) means double the input → slightly more than double the work.

**From LAB-021 (Higher-Order Functions):** A comparator is a function passed as an argument. `Array.prototype.sort(comparator)` uses the same idea.

---

> **Quick Check — try to answer before reading:**
>
> 1. Bubble sort compares adjacent elements. What is the most comparisons it can make on an array of 8 elements?
> 2. Merge sort divides the array in half at each level. How many levels are there for an array of 8 elements?
> 3. JavaScript's built-in sort uses timsort. Is it stable? (Does it preserve the relative order of equal elements?)
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Bubble Sort: The O(n²) Baseline

**The problem this step solves:** Demonstrate sorting with the simplest possible algorithm so that the inefficiency is visible and concrete.

Bubble sort makes repeated passes through the array. On each pass, it compares adjacent elements and swaps them if they are in the wrong order. After each full pass, the largest unsorted element has "bubbled" to its correct position at the end.

**The code:**

```js
function bubbleSort(inputArray) {
  const array = [...inputArray];   // avoid mutating the original
  const length = array.length;

  for (let passCount = 0; passCount < length - 1; passCount++) {
    let swapOccurred = false;

    for (let index = 0; index < length - 1 - passCount; index++) {
      if (array[index] > array[index + 1]) {
        // Swap adjacent elements
        const temporary = array[index];
        array[index] = array[index + 1];
        array[index + 1] = temporary;
        swapOccurred = true;
      }
    }

    if (!swapOccurred) break;   // already sorted — early exit
  }

  return array;
}
```

**The walkthrough — sorting `[5, 3, 8, 1, 2]`:**

**Pass 1:**
- Compare 5, 3: 5 > 3 → swap → `[3, 5, 8, 1, 2]`
- Compare 5, 8: 5 < 8 → no swap → `[3, 5, 8, 1, 2]`
- Compare 8, 1: 8 > 1 → swap → `[3, 5, 1, 8, 2]`
- Compare 8, 2: 8 > 2 → swap → `[3, 5, 1, 2, 8]`
Largest element (8) is now in position. ✓

**Pass 2:**
- Compare 3, 5: no swap.
- Compare 5, 1: swap → `[3, 1, 5, 2, 8]`
- Compare 5, 2: swap → `[3, 1, 2, 5, 8]`
Second-largest (5) is in position. ✓

Passes continue until sorted: `[1, 2, 3, 5, 8]`.

**Why O(n²):** The outer loop runs n−1 times. The inner loop runs approximately n times on the first pass, n−1 on the second, and so on. Total comparisons ≈ (n−1) + (n−2) + ... + 1 = n(n−1)/2 ≈ n²/2. This is O(n²).

**The early-exit optimisation:** If a full pass completes with no swaps, the array is already sorted. On a nearly-sorted array, this makes bubble sort approach O(n). This does not change the worst-case, but it is the kind of observation that distinguishes algorithmic thinking from just running code.

---

### Step 2 — Merge Sort: Divide and Conquer at O(n log n)

**The problem this step solves:** Sort an array in O(n log n) time using the divide-and-conquer principle.

The divide-and-conquer approach:
1. **Divide:** Split the array in half.
2. **Conquer:** Sort each half recursively (same algorithm, smaller problem).
3. **Combine:** Merge the two sorted halves into one sorted array.

The combine step — merging two sorted arrays — is O(n) and is the key insight.

**The code:**

```js
function mergeSort(inputArray) {
  // Base case: arrays of 0 or 1 element are already sorted
  if (inputArray.length <= 1) return inputArray;

  const midpoint = Math.floor(inputArray.length / 2);
  const leftHalf  = mergeSort(inputArray.slice(0, midpoint));
  const rightHalf = mergeSort(inputArray.slice(midpoint));

  return mergeSortedArrays(leftHalf, rightHalf);
}

function mergeSortedArrays(leftArray, rightArray) {
  const mergedArray = [];
  let leftIndex  = 0;
  let rightIndex = 0;

  while (leftIndex < leftArray.length && rightIndex < rightArray.length) {
    if (leftArray[leftIndex] <= rightArray[rightIndex]) {
      mergedArray.push(leftArray[leftIndex]);
      leftIndex++;
    } else {
      mergedArray.push(rightArray[rightIndex]);
      rightIndex++;
    }
  }

  // One of the arrays may still have remaining elements
  while (leftIndex < leftArray.length)  mergedArray.push(leftArray[leftIndex++]);
  while (rightIndex < rightArray.length) mergedArray.push(rightArray[rightIndex++]);

  return mergedArray;
}
```

**The walkthrough — sorting `[38, 27, 43, 3]`:**

```
mergeSort([38, 27, 43, 3])
├── mergeSort([38, 27])
│   ├── mergeSort([38]) → [38]
│   ├── mergeSort([27]) → [27]
│   └── merge([38], [27]) → [27, 38]
├── mergeSort([43, 3])
│   ├── mergeSort([43]) → [43]
│   ├── mergeSort([3])  → [3]
│   └── merge([43], [3]) → [3, 43]
└── merge([27, 38], [3, 43]):
    Left: [27, 38], Right: [3, 43]
    3 < 27 → take 3.  Left: [27,38], Right: [43]
    27 < 43 → take 27. Left: [38], Right: [43]
    38 < 43 → take 38. Left: [], Right: [43]
    Remaining: take 43.
    Result: [3, 27, 38, 43]  ✓
```

**Why O(n log n):**

- **Depth of recursion:** Each level halves the array size. An array of n reaches single elements after log₂(n) halvings. There are log₂(n) levels.
- **Work per level:** At each level, every element is touched exactly once by the merge operation — O(n) per level.
- **Total:** log₂(n) levels × O(n) per level = O(n log n).

This is the mathematical lower bound for comparison-based sorting. No algorithm that sorts by comparing pairs of elements can do better than O(n log n) in the worst case. This is proven by information theory: there are n! possible orderings of n elements; each comparison eliminates half the possibilities; you need at least log₂(n!) ≈ n log n comparisons.

**The CS lens — stable sort:** `<=` in the merge means equal elements from the left array are taken before equal elements from the right array. This preserves their original relative order — merge sort is **stable**. Stability matters when sorting objects: sorting employees by salary after sorting by department should keep the department ordering for employees with the same salary.

**The SE lens — immutable inputs:** Both functions return new arrays and never mutate their inputs. This is the pure function principle from LAB-019. Sorting in place (as quicksort typically does) is faster but makes the function harder to reason about, harder to compose, and harder to test.

---

### Step 3 — Performance Comparison

```js
function timeSort(sortFunction, arraySize) {
  const testArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 1000));
  const startTime = performance.now();
  sortFunction(testArray);
  return (performance.now() - startTime).toFixed(2) + 'ms';
}

// Compare at different sizes
[100, 1000, 5000].forEach(size => {
  console.log(`n=${size}: bubble=${timeSort(bubbleSort, size)}, merge=${timeSort(mergeSort, size)}`);
});
```

At n=1000, bubble sort is measurably slower. At n=5000, the difference is dramatic. This is O(n²) vs O(n log n) made concrete.

---

### Step 4 — When Not to Use Comparison Sort

**The CS lens — non-comparison sorts:** The O(n log n) lower bound applies only to sorts that determine order by comparing pairs. If you have additional information about the data, you can do better.

**Counting sort** runs in O(n + k) where k is the range of values. Sort an array of integers between 0 and 100: count how many times each value appears, then output each value that many times. No comparisons needed.

```js
function countingSort(inputArray, maxValue) {
  const countBucket = new Array(maxValue + 1).fill(0);
  for (const value of inputArray) countBucket[value]++;
  const sortedResult = [];
  countBucket.forEach((count, value) => {
    for (let i = 0; i < count; i++) sortedResult.push(value);
  });
  return sortedResult;
}

// O(n + k) where k = 100
console.log(countingSort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5], 9));
// [1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]
```

When the value range k is small relative to n, counting sort beats merge sort. When k is large (sorting 32-bit integers), it is impractical. The choice of algorithm depends on what you know about the data — not just Big-O.

---

## Connect the Pieces

- **JavaScript's `Array.prototype.sort`** uses **timsort** — a hybrid of merge sort and insertion sort, optimised for real-world data that is often nearly sorted. It is O(n log n) worst-case and stable. The comparator function `(a, b) => a - b` for ascending numbers is the same role as `<=` in `mergeSortedArrays`.
- **Python's `sorted()`** also uses timsort — the algorithm was actually invented for Python and later adopted by Java, JavaScript, and others.
- **Database `ORDER BY`** uses quicksort or heapsort internally (not merge sort) because both are O(n log n) in-place and avoid the O(n) extra memory that merge sort uses. Trade-offs exist even at O(n log n).
- **Stable sort matters in practice:** If you sort a list of transactions by amount and then by date, you need a stable sort to preserve the amount ordering within the same date.

---

## What Breaks Without This

**Forgetting to handle remaining elements in merge:**

```js
function buggyMerge(left, right) {
  const result = [];
  let leftIndex = 0, rightIndex = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    result.push(left[leftIndex] <= right[rightIndex] ? left[leftIndex++] : right[rightIndex++]);
  }
  // BUG: never copies remaining elements
  return result;
}
```

`buggyMerge([1, 3, 5], [2, 4])` returns `[1, 2, 3, 4]` — missing `5`. The while loop exits when one array is exhausted. The remaining elements in the other array must be appended. This is a one-off error that only appears on arrays of unequal length.

---

## Definition of Done

- [ ] `bubbleSort([5, 3, 8, 1, 2])` returns `[1, 2, 3, 5, 8]`
- [ ] `mergeSort([38, 27, 43, 3])` returns `[3, 27, 38, 43]`
- [ ] `mergeSort([])` returns `[]` (empty array)
- [ ] `mergeSort([1])` returns `[1]` (single element)
- [ ] You can explain in one sentence why merge sort is O(n log n) using "log n levels × O(n) per level"
- [ ] `countingSort([3,1,4,1,5,9,2,6], 9)` returns the correctly sorted array

**Git commit:**

```
git add src/
git commit -m "LAB-031: bubble sort (O(n²)) and merge sort (O(n log n)) — divide-and-conquer explained; O(n log n) lower bound proved by information theory"
```

---

## Quick Check Answers

1. **28 comparisons.** On the first pass: 7. Second: 6. ... Seventh: 1. Total = 7+6+5+4+3+2+1 = 28 = n(n−1)/2 where n=8.
2. **3 levels.** 8 → 4 → 2 → 1. log₂(8) = 3. Each halving is one level. At level 3 every subarray has 1 element (already sorted).
3. **Yes, timsort is stable.** JavaScript's sort has been stable in all major browsers since 2019. Before that, Chrome's V8 used an unstable in-place algorithm for large arrays. If you depend on stability, you can verify: sort an array of objects with equal keys and check that original order is preserved.
