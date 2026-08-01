# LAB-005 — Big-O Notation and Algorithm Complexity

**Series:** FOUNDATIONS — Part I: How Computers Work
**Prerequisite Labs:** LAB-000 (Binary, Bytes)
**Time estimate:** 60–75 minutes

---

## What You Will Be Able to Do After This Lab

- Read `O(1)`, `O(n)`, `O(n²)`, `O(log n)` and explain what each means in plain language
- Look at a function with a loop and immediately know its complexity
- Explain why an O(n²) algorithm that works fine with 100 items destroys performance with 10,000 items
- Distinguish time complexity from space complexity

---

## Prerequisites

You are assumed to know:
- **Binary** (LAB-000): numbers can be represented in different bases
- What a loop is, what an array is, what a function is

---

## The Hook — Same Problem, Wildly Different Speeds

Open DevTools Console. Run this:

```javascript
// Build an array of 10,000 numbers
const bigArray = Array.from({ length: 10000 }, (_, i) => i);

// METHOD 1: Index lookup — find element at position 5000
function getByIndex(arr, index) {
  return arr[index];
}

// METHOD 2: Search — find element equal to 5000
function searchValue(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

// Time both
const t1 = performance.now();
for (let i = 0; i < 100000; i++) getByIndex(bigArray, 5000);
const t2 = performance.now();
for (let i = 0; i < 100000; i++) searchValue(bigArray, 5000);
const t3 = performance.now();

console.log("Index lookup (100k times):", Math.round(t2 - t1) + "ms");
console.log("Linear search (100k times):", Math.round(t3 - t2) + "ms");
```

**SAVE AND TRY:** Run this. The index lookup will be measurably faster — often by 10×–50×.

Now double the array to 20,000. Run it again.

- Index lookup time: barely changes
- Linear search time: roughly doubles

**That ratio — how runtime changes as input grows — is what Big-O measures.**

---

## Concept Block 1 — What Big-O Is

**What it is:**
Big-O notation describes the relationship between **input size** and **how much work an algorithm does**. It answers the question: "If I double the input, what happens to the runtime?"

The "O" stands for "Order of" — as in, "the runtime grows on the order of n" or "on the order of n squared."

**What it does NOT measure:**
- How fast your computer is
- How long the algorithm takes in seconds
- The exact number of operations

Big-O is about **growth rate**, not absolute time. An O(n) algorithm on a slow machine can be faster than O(n²) on a fast machine — for large enough n.

**What it hides:**
Big-O drops constants and lower-order terms. `3n + 7` becomes `O(n)`. `2n² + 100n + 500` becomes `O(n²)`. This is intentional — at scale, constants become irrelevant.

**Why drop constants?**
Because hardware differences overwhelm them. A 3× constant advantage today might disappear when the other team gets a faster server. But an O(n) algorithm will **always** beat an O(n²) algorithm for large enough n, no matter the hardware.

**The test:** Take any two algorithms with different Big-O. Make n large enough. The better Big-O wins every time.

**Watch for:**
Whenever you see "this works fine now" — ask "what happens when the input is 1000× larger?" That is the Big-O question.

---

## Concept Block 2 — O(1): Constant Time

**What it is:**
The work done does not depend on input size at all. One operation — always.

**Canonical examples:**
```javascript
// Array index access — always one memory read, regardless of array length
const arr = [10, 20, 30];
const first = arr[0];       // O(1)
const last = arr[2];        // O(1) — not O(3), not O(n). Always 1 step.

// Object property access — hash table lookup, O(1)
const obj = { name: "Alice", age: 30 };
const name = obj.name;      // O(1)

// Math operations
const sum = 42 + 58;        // O(1)
```

**Why array index is O(1):**
From LAB-000 — an array is stored at a known memory address. Element at index `i` is at `base_address + (i × element_size)`. That formula is one multiplication and one addition. The browser can compute it in constant time regardless of array length.

**SAVE AND TRY:**

```javascript
const small = new Array(10).fill(0);
const large = new Array(1000000).fill(0);

const t1 = performance.now();
for (let i = 0; i < 1000000; i++) small[5];
const t2 = performance.now();
for (let i = 0; i < 1000000; i++) large[500000];
const t3 = performance.now();

console.log("Small array access (1M times):", Math.round(t2 - t1) + "ms");
console.log("Large array access (1M times):", Math.round(t3 - t2) + "ms");
// → Approximately the same time. That is O(1).
```

**Change something:** Try `large[999999]` vs `large[0]`. Does it matter which index? (It should not — all indices are O(1).)

---

## Concept Block 3 — O(n): Linear Time

**What it is:**
The work done grows proportionally to input size. Double the input → double the work.

**Canonical example:**

```javascript
function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {  // visits every element once
    total += arr[i];
  }
  return total;
}

// 10 elements → 10 additions
// 100 elements → 100 additions
// 1,000,000 elements → 1,000,000 additions
// It grows linearly with n = arr.length
```

**How to identify O(n):** One loop over the input. Every loop iteration does O(1) work. Total: O(n).

**SAVE AND TRY:**

```javascript
function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) total += arr[i];
  return total;
}

const n1k   = new Array(1000).fill(1);
const n10k  = new Array(10000).fill(1);
const n100k = new Array(100000).fill(1);

function timeIt(fn, arg) {
  const t = performance.now();
  for (let i = 0; i < 100; i++) fn(arg);
  return performance.now() - t;
}

console.log("1k:  ", timeIt(sum, n1k).toFixed(2) + "ms");
console.log("10k: ", timeIt(sum, n10k).toFixed(2) + "ms");
console.log("100k:", timeIt(sum, n100k).toFixed(2) + "ms");
// Each should be ~10x the previous. That is O(n).
```

---

## Concept Block 4 — O(n²): Quadratic Time

**What it is:**
The work done grows proportionally to the **square** of the input size. Double the input → four times the work. Ten times the input → one hundred times the work.

**How O(n²) happens:**
A loop inside a loop, both over the same input.

```javascript
function hasDuplicates(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {    // ← nested loop
      if (i !== j && arr[i] === arr[j]) return true;
    }
  }
  return false;
}

// n=10  → up to 100 comparisons
// n=100 → up to 10,000 comparisons
// n=1000 → up to 1,000,000 comparisons
```

**SAVE AND TRY — see it break:**

```javascript
function hasDuplicates(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (i !== j && arr[i] === arr[j]) return true;
    }
  }
  return false;
}

const n100  = Array.from({ length: 100 },  (_, i) => i);
const n1000 = Array.from({ length: 1000 }, (_, i) => i);
const n5000 = Array.from({ length: 5000 }, (_, i) => i);

function timeIt(fn, arg) {
  const t = performance.now();
  fn(arg);
  return (performance.now() - t).toFixed(2);
}

console.log("n=100: ", timeIt(hasDuplicates, n100) + "ms");
console.log("n=1000:", timeIt(hasDuplicates, n1000) + "ms");
console.log("n=5000:", timeIt(hasDuplicates, n5000) + "ms");

// n=1000 should be ~100x slower than n=100 (10² = 100)
// n=5000 should be ~25x slower than n=1000 (5² = 25)
```

**SAVE AND TRY:** Verify the ratios. If n=100 takes 0.1ms, n=1000 should take ~10ms, n=10000 would take ~1000ms (1 second). That is quadratic growth.

**Change something:** Make the array have duplicates at the end: `arr[arr.length - 1] = arr[0]`. Does it get faster? Why? (Best case vs worst case.)

---

## Concept Block 5 — O(log n): Logarithmic Time

**What it is:**
The work done grows by one step each time the input **doubles**. Ten doublings cover 1024 items. Twenty doublings cover over a million. For very large inputs, O(log n) is almost as fast as O(1).

**Where O(log n) comes from:**
Algorithms that cut the problem in half at each step. Binary search is the canonical example.

**Binary search — how it works:**

You have a sorted array. You want to find a value.
1. Check the middle element.
2. If it is the target → done.
3. If the target is smaller → search the left half.
4. If the target is larger → search the right half.
5. Repeat with the half-sized array.

Each step cuts the problem in half. For an array of 1,000,000 elements, you need at most **20 steps**. That is `log₂(1,000,000) ≈ 20`.

```javascript
function binarySearch(sortedArr, target) {
  let left = 0;
  let right = sortedArr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (sortedArr[mid] === target) return mid;
    if (sortedArr[mid] < target) left = mid + 1;   // search right half
    else right = mid - 1;                           // search left half
  }
  
  return -1; // not found
}
```

**SAVE AND TRY:**

```javascript
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// Must be sorted for binary search to work
const sorted = Array.from({ length: 1000000 }, (_, i) => i);
const target = 999999; // worst case — it is at the end

function timeIt(fn, arr, target) {
  const t = performance.now();
  for (let i = 0; i < 1000; i++) fn(arr, target);
  return (performance.now() - t).toFixed(2);
}

console.log("Linear search (1M array, 1k times):", timeIt(linearSearch, sorted, target) + "ms");
console.log("Binary search (1M array, 1k times):", timeIt(binarySearch, sorted, target) + "ms");
// Binary search should be dramatically faster — it takes ~20 steps vs ~1,000,000
```

**Why the requirement "sorted"?**
Binary search only works on sorted data because it assumes "if target > middle, target must be in the right half." In an unsorted array, that assumption is false. Sorting costs O(n log n) — you have to decide if that upfront cost is worth faster searches later.

---

## Concept Block 6 — Common Complexities Compared

The hierarchy from fastest to slowest growth:

| Big-O | Name | Example | n=10 steps | n=1000 steps | n=1,000,000 steps |
|-------|------|---------|-----------|-------------|------------------|
| O(1) | Constant | Array index | 1 | 1 | 1 |
| O(log n) | Logarithmic | Binary search | 3 | 10 | 20 |
| O(n) | Linear | Array sum | 10 | 1,000 | 1,000,000 |
| O(n log n) | Linearithmic | Merge sort | 33 | 10,000 | 20,000,000 |
| O(n²) | Quadratic | Nested loop | 100 | 1,000,000 | 10¹² |
| O(2^n) | Exponential | Fibonacci (naive recursive) | 1,024 | 10³⁰⁰ | absurd |

**The cliff between O(n log n) and O(n²):**
At n=10,000, O(n²) does 100 million operations. O(n log n) does ~130,000. For sorting — merge sort (O(n log n)) exists specifically because bubble sort (O(n²)) collapses on real data.

**SAVE AND TRY — see O(2^n) explode:**

```javascript
// Naive recursive Fibonacci — O(2^n)
// Each call branches into two more calls
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// Time it for increasing n
for (const n of [10, 20, 30, 35, 40]) {
  const start = performance.now();
  const result = fib(n);
  const ms = (performance.now() - start).toFixed(1);
  console.log(`fib(${n}) = ${result} — took ${ms}ms`);
}
```

**SAVE AND TRY:** Watch the time explode. `fib(40)` may take seconds. `fib(50)` would take years. This is the same Fibonacci from LAB-001 — now you have the vocabulary to say *why* it is catastrophically slow.

**Do not run past n=42 or so — it will freeze the tab.**

---

## Concept Block 7 — Space Complexity

**What it is:**
The same O-notation applied to **memory usage** instead of time. How much extra memory does the algorithm need as input grows?

**Why it matters:**
A time-fast algorithm that uses O(n²) memory fails at scale. Downloading a file and storing every byte in memory is fine at 10MB; at 10GB it crashes the process.

**Examples:**

```javascript
// O(1) space — only uses a fixed number of variables regardless of input size
function sum(arr) {
  let total = 0;  // one variable — O(1) space
  for (let i = 0; i < arr.length; i++) total += arr[i];
  return total;
}

// O(n) space — creates a new array the same size as input
function doubled(arr) {
  return arr.map(x => x * 2);  // new array of length n → O(n) space
}

// O(n²) space — creates an n×n grid
function multiplicationTable(n) {
  const table = [];
  for (let i = 0; i < n; i++) {
    table.push(new Array(n).fill(0));  // n rows, each n wide → n² cells
  }
  return table;
}
```

**SAVE AND TRY — see memory growth:**

```javascript
const sizes = [100, 1000, 10000];

for (const n of sizes) {
  const table = [];
  for (let i = 0; i < n; i++) table.push(new Array(n).fill(0));
  const cells = n * n;
  console.log(`n=${n}: ${cells.toLocaleString()} cells (${(cells * 8 / 1024 / 1024).toFixed(1)} MB)`);
}
// At n=10000: 100,000,000 cells → ~800 MB just for this table
```

A quadratic memory algorithm running on production data is a memory crash waiting to happen.

---

## Concept Block 8 — Best, Worst, and Average Case

**What it is:**
Most algorithms do not always take the same number of steps — it depends on the input. Big-O without qualification means **worst case** by convention.

**Canonical example — linear search:**

```javascript
function search(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;  // could return on the first check
  }
  return -1;
}
```

- **Best case:** target is at index 0 → O(1) (one comparison)
- **Average case:** target is in the middle → O(n/2) → O(n) (drop the constant)
- **Worst case:** target is not in the array → O(n) (checks every element)

**Why worst case?**
When designing systems, you plan for the worst. An algorithm that is O(1) best case and O(n²) worst case is an O(n²) algorithm for reliability planning purposes.

**Watch for:**
Interview questions often ask "what is the time complexity?" — they mean worst case. If they want average or best, they will ask explicitly.

---

## How to Read Any Algorithm — The Rules

**Rule 1:** A loop over n items = O(n). Unless the loop does fewer iterations based on the algorithm.

**Rule 2:** Nested loops over the same n = multiply. Two nested loops = O(n²). Three nested loops = O(n³).

**Rule 3:** Sequential sections = add, then drop the lower term.
```
O(n) + O(n²) = O(n² + n) = O(n²)
O(n) + O(1)  = O(n + 1)  = O(n)
```

**Rule 4:** If the loop variable halves each iteration → O(log n).
```javascript
while (n > 1) {
  n = Math.floor(n / 2);  // halves each time → O(log n) iterations
}
```

**Rule 5:** Recursion that branches into k calls at each level, with depth d → O(k^d).

**SAVE AND TRY — classify these:**

```javascript
// What is the Big-O of each function?

function A(arr) {
  return arr[0] + arr[arr.length - 1];
}

function B(arr) {
  let count = 0;
  for (let i = 0; i < arr.length; i++) count++;
  for (let i = 0; i < arr.length; i++) count++;
  return count;
}

function C(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}

function D(n) {
  let result = 1;
  while (n > 1) {
    result *= n;
    n = Math.floor(n / 2);
  }
  return result;
}
```

Before checking the answers — write your classification for each.

<details>
<summary>Answers</summary>

- **A:** O(1) — two array accesses, no loops, no recursion
- **B:** O(n) — two separate O(n) loops = O(2n) = O(n)
- **C:** O(n²) — nested loop. The inner loop starts at `i+1` so it is n²/2 comparisons, but Big-O drops the ½ constant → O(n²)
- **D:** O(log n) — `n` halves each iteration, so the loop runs log₂(n) times

</details>

---

## Challenge

**Task:** A product catalog has `n` items. You need to find all pairs of items whose prices sum to exactly `targetPrice`.

```javascript
// GIVEN
const prices = [10, 20, 30, 40, 50, 60, 70];
const targetPrice = 80;
// Expected output: [[10, 70], [20, 60], [30, 50]]
```

**Part 1:** Write an O(n²) solution using nested loops.

**Part 2:** Write an O(n) solution using a Set (a hash set — lookup in a Set is O(1)).

**Part 3:** Time both solutions on an array of 10,000 prices and verify that the O(n) version is dramatically faster.

Requirements:
- Both functions must produce the same output
- Each pair should appear only once (not `[10, 70]` and also `[70, 10]`)
- Works when pasted into DevTools console

<details>
<summary>Solution</summary>

```javascript
// PART 1: O(n²) — nested loops
function findPairsQuadratic(prices, target) {
  const pairs = [];
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {  // j starts at i+1 to avoid duplicates
      if (prices[i] + prices[j] === target) {
        pairs.push([prices[i], prices[j]]);
      }
    }
  }
  return pairs;
}

// PART 2: O(n) — one pass with a Set
function findPairsLinear(prices, target) {
  const seen = new Set();
  const pairs = [];
  
  for (const price of prices) {
    const complement = target - price;
    if (seen.has(complement)) {
      // Order the pair so smaller value comes first (avoids duplicates)
      pairs.push([Math.min(price, complement), Math.max(price, complement)]);
    }
    seen.add(price);
  }
  
  return pairs;
}

// PART 3: Timing comparison
const n = 10000;
const bigPrices = Array.from({ length: n }, (_, i) => i + 1);
const bigTarget = n + 1;  // every consecutive pair (1, n), (2, n-1) etc.

function timeIt(fn, prices, target) {
  const t = performance.now();
  fn(prices, target);
  return (performance.now() - t).toFixed(1);
}

console.log("Test (small):");
console.log("Quadratic:", findPairsQuadratic([10, 20, 30, 40, 50, 60, 70], 80));
console.log("Linear:   ", findPairsLinear([10, 20, 30, 40, 50, 60, 70], 80));

console.log("\nPerformance (n=10,000):");
console.log("O(n²):", timeIt(findPairsQuadratic, bigPrices, bigTarget) + "ms");
console.log("O(n): ", timeIt(findPairsLinear,    bigPrices, bigTarget) + "ms");
```

**Key insight:** The O(n) solution works because finding "does `complement` exist?" in a Set is O(1). So one loop with O(1) lookups = O(n) total. The O(n²) solution checks every possible pair — at n=10,000 that is 50 million pair checks.

**Why `seen.has(complement)` before `seen.add(price)`?**
If we add first and check second, `price + price === target` would find a pair with itself. For example, if `target = 20` and `price = 10`, we would incorrectly return `[10, 10]` even if `10` appears only once.

</details>

---

## Summary

| Complexity | Meaning | Trigger | Scales to n=1M? |
|---|---|---|---|
| O(1) | Same time always | Array index, hash lookup | Yes — trivially |
| O(log n) | Doubles input → +1 step | Halving at each step | Yes — 20 steps |
| O(n) | Proportional to input | One loop | Yes — careful |
| O(n log n) | Slightly worse than linear | Best sorting algorithms | Usually |
| O(n²) | Input² work | Nested loops | No — 10¹² ops |
| O(2^n) | Doubles with each +1 input | Naive recursion, subsets | Never |

**The single most important rule:**
Nested loops over the same data = O(n²). That is where most beginner performance bugs live. When you see a loop inside a loop, immediately ask: "Do both loops depend on n? Can I break this into one pass with a hash lookup?"

---

*Next: LAB-006 — Functions as First-Class Values*
