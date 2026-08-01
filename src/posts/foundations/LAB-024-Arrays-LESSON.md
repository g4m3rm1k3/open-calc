# FOUNDATIONS — LAB-024 — Arrays: Linear Data Structure and O(n) Operations

**Series:** FOUNDATIONS — Part V: Data Structures
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 55–70 minutes.

---

## What You Will Build

A set of timing experiments that measure the actual performance difference between O(1) array access and O(n) linear search, a visual demonstration of why inserting at the start of an array is O(n), and an analysis of when to use an array vs a hash table vs a linked list. After this lab, you will be able to classify any array operation by its time complexity, explain the memory model that makes O(1) access possible, and choose the right data structure based on an operation's access pattern.

---

## What You Need to Know First

**From LAB-005 (Big-O Notation):** O(1) means the operation takes constant time regardless of the collection's size. O(n) means the time grows linearly with the collection's size. O(log n) means it grows slowly (discussed more in LAB-029).

**From LAB-000 (Binary, Bytes, Memory):** Memory is addressed by index. Contiguous memory — blocks stored sequentially — allows jumping directly to any address by arithmetic.

---

> **Quick Check — try to answer before reading:**
>
> 1. `arr[500]` — why is this O(1) even if the array has a million elements?
> 2. You need to add an element to the START of a 10,000-element array. Why does this require 10,000 operations in the worst case?
> 3. `arr.push(x)` adds to the end. `arr.unshift(x)` adds to the start. Which is faster? Why?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Why Array Access Is O(1)

**The problem this step solves:** Explain the memory model that makes index-based access constant time.

**The code:**

```js
// Arrays in JavaScript store elements in contiguous memory
// (the JavaScript engine handles the details — this is the logical model)

const arr = [10, 20, 30, 40, 50];

// O(1) access: any index, any time
console.log(arr[0]);    // → 10
console.log(arr[4]);    // → 50
console.log(arr[2]);    // → 30
```

**The walkthrough — why `arr[4]` takes the same time as `arr[0]`:**

When an array is created, the JavaScript engine allocates a block of contiguous memory. Conceptually (the actual engine is more complex, but the performance model holds):

```
Memory:  [10] [20] [30] [40] [50]
Address:  100  108  116  124  132  (each element takes some bytes)
```

To access `arr[index]`:
1. `base_address + (index × element_size)` — one multiplication and one addition
2. Read the value at that address

This arithmetic is O(1) — it takes the same number of operations regardless of array size. `arr[4]` and `arr[4000000]` both require exactly one arithmetic operation and one memory read.

**CS lens — direct addressing:**

Arrays are the most fundamental data structure because they map directly to how computer memory works. Memory itself is an array: each byte has an address, and you access any byte in constant time by specifying its address. An array in a programming language is a slice of this memory, with index arithmetic translating between array indices and memory addresses. This is why arrays are the baseline data structure that all others are measured against.

**SE lens — the O(1) access contract:**

The promise of an array is: `arr[i]` is always O(1). This contract is why arrays are the right choice when you know the index of the element you want: rendering a list (element N is the Nth item), audio sample buffers (sample N is at time N/sampleRate), pixel data (pixel at row R column C is at index R*width+C). All of these use index arithmetic to jump directly to the element.

**What breaks if you search by value:**

`arr.indexOf(40)` — finding a value by searching requires checking each element from the start: `arr[0] === 40?` No. `arr[1] === 40?` No. ... `arr[3] === 40?` Yes. In the worst case (element not present or at the end), all N elements are checked: O(n). Access by index is O(1); search by value is O(n). This distinction drives the choice between arrays and hash tables.

---

### SAVE AND TRY

```js
// Verify O(1) access — timing is approximately equal for any index
const large = Array.from({ length: 1_000_000 }, (_, i) => i * 2);

console.time("access first");
for (let i = 0; i < 1_000_000; i++) { large[0]; }
console.timeEnd("access first");

console.time("access last");
for (let i = 0; i < 1_000_000; i++) { large[999_999]; }
console.timeEnd("access last");
```

`Array.from({ length: n }, (_, i) => expr)` — creates an array of `n` elements where each element is computed by the callback. `(_, i) => i * 2` uses `_` for the value (ignored, as the first callback argument is the element value which is `undefined` for unfilled slots) and `i` for the index. Produces `[0, 2, 4, 6, ...]`.

`console.time("label")` and `console.timeEnd("label")` — browser timing API. `console.time` starts a named timer; `console.timeEnd` stops it and logs the elapsed milliseconds. Used here to compare access times.

Expected: both timings are approximately equal — O(1) access means array size and index position do not affect the time.

**Change something:** Compare accessing `large[0]` vs `large[500_000]` vs `large[999_999]`. Expected: all approximately the same time. Then try `large.indexOf(999_998)` (near the end of the array) and time it. Expected: significantly slower than index access — O(n) search.

---

### Step 2 — Why Search is O(n) and Insertion at Start is O(n)

**The problem this step solves:** Show the two most common O(n) operations and the mechanical reason for each.

**The code — linear search:**

```js
function linearSearch(arr, target) {
  for (let index = 0; index < arr.length; index++) {
    if (arr[index] === target) {
      return index;   // found — return index
    }
  }
  return -1;   // not found
}

const data = [5, 12, 3, 8, 42, 7, 19, 1];

console.log(linearSearch(data, 42));    // → 4  (found at index 4)
console.log(linearSearch(data, 100));   // → -1 (not found — checked all 8 elements)
```

**The walkthrough — `linearSearch(data, 100)`:**

The algorithm checks `data[0]`, `data[1]`, ..., `data[7]` in order. None match. Returns `-1`. For an array of N elements, the worst case requires N comparisons. If the array doubles in size, the worst-case search time doubles: O(n).

**The code — insertion at the start:**

```js
// Simulation of what unshift() must do:
function insertAtStart(arr, element) {
  // MUST shift every existing element one position to the right
  // to make room at index 0
  const newArr = new Array(arr.length + 1);
  newArr[0] = element;
  for (let i = 0; i < arr.length; i++) {
    newArr[i + 1] = arr[i];   // each element moves one position right
  }
  return newArr;
}

const before = [10, 20, 30, 40];
const after  = insertAtStart(before, 5);
console.log(after);   // → [5, 10, 20, 30, 40]
```

**The walkthrough — inserting at the start of a 4-element array:**

```
Before: [10] [20] [30] [40]
         ^0   ^1   ^2   ^3

After insertion of 5 at index 0:
        [5] [10] [20] [30] [40]
         ^0   ^1   ^2   ^3   ^4
```

Every element from index 0 to 3 must be copied to index 1 to 4. That is 4 copy operations for a 4-element array. For a million-element array: a million copy operations. O(n).

`arr.unshift(element)` — the built-in JavaScript method that inserts an element at the beginning of an array. It is O(n) internally, for exactly the reason shown above.

`arr.push(element)` — inserts at the END of the array. No shifting required — the new element goes after the last one. O(1) (amortized — see the Watch for below).

**CS lens — amortized O(1) for push:**

JavaScript arrays are **dynamic arrays**: they grow automatically. When the internal buffer is full, `push` allocates a new, larger buffer (typically 2× the current size) and copies all elements. The copy is O(n) — but it happens rarely. Averaged over many pushes, the cost per push is O(1). This is called **amortized O(1)**. The occasional expensive resize is spread over the many O(1) pushes that follow it.

**SE lens — access pattern drives data structure choice:**

| Operation | Array | Use when... |
|-----------|-------|-------------|
| Access by index | O(1) | You know which element you want |
| Search by value | O(n) | Use a hash table instead |
| Insert at end | O(1) amortized | Common push/pop use case |
| Insert at start | O(n) | Use a linked list or deque instead |
| Delete from middle | O(n) | Use a linked list instead |

**What breaks when you treat O(n) insertions as cheap:**

Calling `arr.unshift(item)` in a loop of N items to build an array of N items: each `unshift` is O(n), called N times: O(n²) total. For 10,000 items: 100,000,000 operations. Comparison: `arr.push` followed by `arr.reverse()` is O(n) + O(n) = O(n). A 10,000× improvement.

---

### SAVE AND TRY

```js
// Demonstrate O(n) search vs O(1) access timing:
const size = 100_000;
const data = Array.from({ length: size }, (_, i) => i);

// O(1): direct access to last element
console.time("O(1) access");
for (let i = 0; i < 10_000; i++) data[size - 1];
console.timeEnd("O(1) access");

// O(n): search for last element (worst case)
console.time("O(n) search");
for (let i = 0; i < 100; i++) data.indexOf(size - 1);
console.timeEnd("O(n) search");
```

Expected: O(1) access is dramatically faster than O(n) search, even though O(1) loop runs 100× more iterations.

**Change something:** Build an array of 10,000 elements by repeatedly calling `unshift` vs `push` and measure the difference:

```js
console.time("push then reverse");
const arr1 = [];
for (let i = 0; i < 10_000; i++) arr1.push(i);
arr1.reverse();
console.timeEnd("push then reverse");

console.time("unshift");
const arr2 = [];
for (let i = 0; i < 10_000; i++) arr2.unshift(i);
console.timeEnd("unshift");
```

Expected: `push` then `reverse` is significantly faster than repeated `unshift`.

---

### Step 3 — Dynamic Arrays and Memory Growth

**The problem this step solves:** Show how JavaScript arrays handle size changes, and what amortized cost means practically.

**The code:**

```js
// Demonstrate the growth behavior of dynamic arrays
// by observing when allocations happen (simulated)

function buildArrayAndMeasure(size) {
  const arr = [];
  const start = performance.now();

  for (let i = 0; i < size; i++) {
    arr.push(i);
  }

  const end = performance.now();
  return end - start;
}

const time1000    = buildArrayAndMeasure(1_000);
const time10000   = buildArrayAndMeasure(10_000);
const time100000  = buildArrayAndMeasure(100_000);
const time1000000 = buildArrayAndMeasure(1_000_000);

console.log(`1K:   ${time1000.toFixed(3)}ms`);
console.log(`10K:  ${time10000.toFixed(3)}ms`);
console.log(`100K: ${time100000.toFixed(3)}ms`);
console.log(`1M:   ${time1000000.toFixed(3)}ms`);
```

`performance.now()` — a higher-precision timer than `Date.now()`. Returns a `DOMHighResTimeStamp` — a floating-point number of milliseconds since the page was loaded, with sub-millisecond precision. Use it for fine-grained performance measurements.

**The walkthrough — what the numbers show:**

The times should scale roughly linearly (O(n)): 10K is about 10× the 1K time; 100K is about 10× the 10K time. If dynamic array resizing were O(n²), each 10× increase in size would produce a 100× increase in time. Linear scaling confirms amortized O(1) for push.

**CS lens — the doubling strategy:**

When an array's internal buffer fills, a new buffer of 2× the current size is allocated and all elements are copied. The sequence of capacities might be: 1, 2, 4, 8, 16, ... The total copy work for N pushes: 1 + 2 + 4 + 8 + ... + N/2 + N ≈ 2N. Over N pushes, 2N copy operations: 2 operations per push on average — O(1) amortized. The occasional O(n) resize is rare enough that it does not affect the per-operation average.

**SE lens — pre-allocation for known sizes:**

If you know the final size in advance, `new Array(n)` pre-allocates space for `n` elements, avoiding all resizes. `Array.from({ length: n }, fn)` does the same. For performance-critical code that builds large arrays, pre-allocation eliminates the amortized resizing cost entirely.

**What breaks with incorrect pre-allocation:**

`new Array(5)` creates a sparse array of length 5 with no actual elements — the slots are empty, not zero. Accessing `new Array(5)[0]` returns `undefined`, not `0`. Pre-allocated arrays must be filled: `Array.from({ length: 5 }, () => 0)` creates `[0, 0, 0, 0, 0]`.

---

### SAVE AND TRY

```js
// Verify the O(n) total for N pushes:
function measurePushes(n) {
  const arr = [];
  const t0 = performance.now();
  for (let i = 0; i < n; i++) arr.push(i);
  return performance.now() - t0;
}

const sizes = [10_000, 100_000, 1_000_000];
sizes.forEach(n => {
  console.log(`${n.toLocaleString()}: ${measurePushes(n).toFixed(2)}ms`);
});
```

`n.toLocaleString()` — formats a number with locale-appropriate thousands separators. `1000000.toLocaleString()` returns `"1,000,000"` in most locales.

Expected: roughly 10× time increase for each 10× size increase — confirming O(n) behavior for N pushes total (O(1) amortized per push).

**Change something:** Compare `measurePushes(1_000_000)` vs building with `Array.from({ length: 1_000_000 }, (_, i) => i)`. The `Array.from` version should be faster or similar — it pre-allocates rather than growing dynamically.

---

## Connect the Pieces

**What you built:** Understanding of O(1) index access (memory arithmetic), O(n) linear search, O(n) insert-at-start (element shifting), O(1) amortized push (dynamic resizing), and the practical consequences of each.

**How it connects to LAB-005 (Big-O):** The array is the first concrete application of Big-O analysis. O(1) access and O(n) search are the two costs that motivate choosing a hash table (O(1) lookup) over an array for search-by-value use cases.

**How it connects forward:**

- **LAB-025 (Hash Tables):** Hash tables have O(1) average search, O(1) insert, and O(1) delete — by sacrificing guaranteed ordering and accepting O(n) worst case. When to use array vs hash table is the fundamental data structure choice.
- **LAB-027 (Stacks and Queues):** Both are specializations of arrays (or linked lists). Stack = array with push/pop only. Queue = array where push happens at one end and pop at the other.
- **LAB-028 (Linked Lists):** Linked lists solve the O(n) insert-at-start problem: O(1) insert at head, but O(n) access by index. The tradeoff is direct.
- **LAB-031 (Sorting):** Sorting algorithms operate on arrays. Merge sort's O(n log n) and bubble sort's O(n²) are meaningless without understanding the O(n) operations they decompose into.

**The real-world connection:**

Every JavaScript `[]` array, Python `list`, Java `ArrayList`, C# `List<T>` is a dynamic array. Every `for` loop over a collection is O(n). Every `.indexOf()`, `.find()`, and `.includes()` on an array is O(n). The O(1) vs O(n) distinction determines whether code is fast enough at scale. A feature that works with 100 items may freeze a browser with 100,000 items if it unknowingly uses O(n) operations inside O(n) loops.

---

## What Breaks Without This

**Concrete failure — O(n²) hidden in a loop:**

```js
function removeDuplicates(arr) {
  const result = [];
  for (const item of arr) {
    if (!result.includes(item)) {  // O(n) search INSIDE an O(n) loop = O(n²)
      result.push(item);
    }
  }
  return result;
}

// Fine for 100 items. Slow for 10,000. Freezes for 100,000.
const thousandItems = Array.from({ length: 1_000 }, (_, i) => i % 500);
console.time("O(n²) dedup");
removeDuplicates(thousandItems);
console.timeEnd("O(n²) dedup");
```

The fix uses a `Set` (O(1) membership test):

```js
function removeDuplicatesFast(arr) {
  return [...new Set(arr)];  // O(n) total: each Set.add is O(1)
}
```

`new Set(arr)` creates a Set from an array, automatically deduplicating. `[...set]` spreads back to an array. Total: O(n). The `Set` version runs 100× faster on 1,000 items and 10,000× faster on 10,000 items compared to the `.includes()` version.

---

## Definition of Done

Verify each item before moving to LAB-025.

- [ ] `arr[index]` accesses any element in the same time regardless of index — verified by timing
- [ ] `linearSearch(arr, target)` returns the correct index or `-1`
- [ ] `insertAtStart` demonstrates the O(n) shifting cost
- [ ] Repeated `push` is ~O(1) amortized — 10× items takes ~10× time, not 100×
- [ ] `arr.unshift` is significantly slower than `arr.push` followed by `arr.reverse` for building a reversed list
- [ ] You can explain why `.includes()` inside a loop is O(n²) and how to fix it with a Set

**Git commit:**

```
git add .
git commit -m "LAB-024: array O(1) access via memory addressing, O(n) search and insert-at-start, amortized push with timing experiments"
```

---

## Quick Check Answers

**1. Why is `arr[500]` O(1) even with a million elements?**

Because array access uses arithmetic: `address = base_address + (500 × element_size)`. This is one multiplication and one addition — two operations regardless of array size. The element is found directly without examining any other elements. The million-element array and the five-element array both require the same arithmetic.

**2. Why does inserting at the start require 10,000 operations for a 10,000-element array?**

The array is stored in contiguous memory. The new element must go at index 0 — but index 0 already has an element. Every existing element must be copied one position to the right to make room. Index 0 → 1, index 1 → 2, ..., index 9999 → 10000. That is 10,000 copy operations. This is inherent to the contiguous memory model: to insert at any position, everything after that position shifts.

**3. Which is faster: `push` or `unshift`? Why?**

`push` is faster: O(1) amortized. It appends to the end — no shifting required. `unshift` is O(n): it shifts every existing element one position right. For a 10,000-element array, `unshift` performs 10,000 shift operations per call; `push` performs 0 shift operations.

---

*Next: LAB-025 — Hash Tables: O(1) Lookup*
