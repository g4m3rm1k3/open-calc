// DSA + Design Patterns — Lesson 03
// Big-O + Strategy

export const lesson = {
  id: 'dsa-patterns-03',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '3. Big-O + Strategy',
  checkpoints: [
    { id: 'cp-bigo',     label: 'Big-O Notation' },
    { id: 'cp-strategy', label: 'Strategy Pattern' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'Your code works perfectly. Fast, correct, no complaints. Then the dataset grows from 100 items to 100,000, and suddenly it takes 30 seconds. You add more data and it takes 50 minutes. Nothing in the code changed. But the code has a hidden cost that only becomes visible at scale, and that cost grows much faster than the data. Every algorithm has a cost that scales with input size. Two algorithms that produce identical results can differ by a factor of a million on large inputs. There is a notation that makes these costs visible before you ever run the code — and a design pattern that lets you swap algorithms in and out when the cost becomes unacceptable.',
      code: null,
    },

    // ── Step 1: What Big-O measures ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-what-bigo-means',
      text: 'Big-O notation describes how the number of operations an algorithm performs grows as the input size grows. It does not measure exact time (which depends on hardware, language, load). It measures growth rate — the shape of the curve when you plot operations against input size. The "n" in Big-O always represents the size of the input: the number of items in an array, the length of a string, the number of nodes in a tree. Big-O describes the worst case: how bad can it get? Dropping constants and lower-order terms is intentional — on large inputs, only the dominant term matters. O(2n) and O(n) have the same curve shape; O(n + 100) and O(n) are identical at scale.',
      code: `// Counting operations to understand Big-O
function findMax(arr) {
  let max = arr[0]
  for (let i = 1; i < arr.length; i++) {  // n iterations
    if (arr[i] > max) max = arr[i]         // 1 comparison per iteration
  }
  return max
}

// Operations: roughly n comparisons for n items
// Double the array → double the work
// This is O(n) — linear growth

const small  = [3, 1, 4, 1, 5, 9, 2, 6]
const large  = new Array(1000000).fill(0).map(() => Math.floor(Math.random() * 1000))

console.log(findMax(small))   // runs 8 comparisons
console.log(findMax(large))   // runs 1,000,000 comparisons — same algorithm, bigger input`,
    },

    // ── Step 2: The main complexity classes ───────────────────────────────────

    {
      type: 'narration',
      id: 'step2-complexity-classes',
      text: 'There are five complexity classes you will encounter in almost every problem. O(1) — constant time: the number of operations does not change regardless of input size. Reading an array element by index is O(1) because the computer calculates one address and jumps there. O(log n) — logarithmic: the problem is cut in half at each step. Binary search is O(log n) because each comparison eliminates half the remaining candidates. On 1 million items: only 20 comparisons. O(n) — linear: one pass through the input. Finding the maximum in an unsorted array is O(n). O(n log n) — linearithmic: a linear number of O(log n) operations. Most efficient sorting algorithms (merge sort, quicksort) are O(n log n). O(n²) — quadratic: a nested loop where each element is compared to every other element. Selection sort, bubble sort. Double the input, quadruple the work.',
      code: `// O(1) — constant: does not depend on input size
function getFirst(arr) {
  return arr[0]  // one operation, always
}

// O(log n) — halves the problem at each step
function binarySearch(sortedArr, target) {
  let lo = 0, hi = sortedArr.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (sortedArr[mid] === target) return mid
    if (sortedArr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}

// O(n) — one pass
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i
  }
  return -1
}

// O(n²) — nested loop: every pair
function hasDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {  // inner loop runs ~n times for each outer
      if (arr[i] === arr[j]) return true
    }
  }
  return false
}

const arr = [1, 3, 5, 7, 9, 11, 13]
console.log(getFirst(arr))              // O(1)
console.log(binarySearch(arr, 7))       // O(log n): index 3
console.log(linearSearch(arr, 7))       // O(n): index 3
console.log(hasDuplicate([1, 2, 3, 2])) // O(n²): true`,
    },

    // ── Step 3: Seeing the cost difference ────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-cost-visible',
      text: 'The difference between complexity classes becomes enormous at scale. On 1,000,000 items: O(1) is always 1 operation; O(log n) is about 20 operations; O(n) is 1,000,000 operations; O(n log n) is about 20,000,000 operations; O(n²) is 1,000,000,000,000 operations — one trillion. The difference between O(n log n) sorting and O(n²) sorting is not stylistic — it is the difference between 0.02 seconds and 16 minutes on a million items. This is why choosing the right algorithm matters. And it is why you need a way to swap algorithms when the cost becomes unacceptable.',
      code: `// Counting operations to make the growth visible
function countOperations(n) {
  return {
    'O(1)':       1,
    'O(log n)':   Math.ceil(Math.log2(n)),
    'O(n)':       n,
    'O(n log n)': n * Math.ceil(Math.log2(n)),
    'O(n²)':      n * n,
  }
}

console.log('n = 10:')
const c10 = countOperations(10)
for (const [k, v] of Object.entries(c10)) console.log(' ', k, '→', v)

console.log('n = 1000:')
const c1000 = countOperations(1000)
for (const [k, v] of Object.entries(c1000)) console.log(' ', k, '→', v)

console.log('n = 1000000:')
const c1m = countOperations(1000000)
for (const [k, v] of Object.entries(c1m)) console.log(' ', k, '→', v)`,
    },

    // ── Challenge: Big-O ──────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-bigo',
      text: 'Write a function called findDuplicateFast(arr) that returns true if the array contains any duplicate value, false otherwise. Do not use a nested loop (which would be O(n²)). Use a Set to track seen values — adding to and checking a Set is O(1), making the whole function O(n). Do not use any built-in duplicate-detection methods. Test with [1, 2, 3, 2] (true) and [1, 2, 3, 4] (false). Log both results.',
      expectedOutput: null,
      startCode: `function findDuplicateFast(arr) {
  // Use a Set to track which values you have seen
  // If you see a value that is already in the Set, return true
  // A Set is a collection that stores unique values (recap from the Arrays lesson)
}

console.log(findDuplicateFast([1, 2, 3, 2]))  // true
console.log(findDuplicateFast([1, 2, 3, 4]))  // false
console.log(findDuplicateFast([]))             // false`,
      hint: 'const seen = new Set(); for each item: if seen.has(item) return true; else seen.add(item). After the loop, return false.',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim().toLowerCase())
        return strs.includes('true') && strs.includes('false')
      },
    },

    { type: 'checkpoint', id: 'cp-bigo' },

    // ── Step 4: Strategy pattern intro ───────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-strategy-intro',
      text: 'The Strategy pattern solves a problem in software design: you have an operation that needs to be done, but the best way to do it changes depending on context. Different data sizes, different data shapes, different performance requirements — all might call for a different algorithm. Without a pattern, you end up with a long if-else chain that makes the decision at the call site, scattered through your code, duplicated and hard to change. The Strategy pattern extracts the algorithm into a separate object. The caller holds a reference to the strategy object. To change the algorithm, you swap the strategy object. The caller does not change. The if-else chain disappears.',
      code: null,
    },

    // ── Step 5: Strategy in code ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-strategy-code',
      text: 'Start with the problem: a search function that uses different algorithms depending on whether the array is sorted. Without Strategy, the if-else lives inside the search function. Build it first, then refactor.',
      code: `// Without Strategy: algorithm selection embedded in the function
function search(arr, target, isSorted) {
  if (isSorted) {
    // O(log n) binary search
    let lo = 0, hi = arr.length - 1
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (arr[mid] === target) return mid
      if (arr[mid] < target) lo = mid + 1
      else hi = mid - 1
    }
    return -1
  } else {
    // O(n) linear search
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === target) return i
    }
    return -1
  }
}

// What if you need a third algorithm? Edit the function.
// What if the caller needs to know which algorithm ran? Add more params.
// The algorithm logic is trapped inside the function.
console.log(search([1, 3, 5, 7, 9], 7, true))   // binary: 3
console.log(search([5, 1, 9, 3, 7], 7, false))  // linear: 4`,
    },

    // ── Step 6: Refactor to Strategy ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-strategy-refactor',
      text: 'Refactor: extract each algorithm into its own strategy object. Each strategy has the same interface — a single search(arr, target) method. The Searcher class holds a reference to the current strategy. To change the algorithm, call setStrategy() and pass a different strategy object.',
      code: `// Strategy objects — each encapsulates one algorithm
const linearSearch = {
  search(arr, target) {                  // ← NEW: O(n) strategy
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === target) return i
    }
    return -1
  }
}

const binarySearch = {
  search(arr, target) {                  // ← NEW: O(log n) strategy
    let lo = 0, hi = arr.length - 1
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (arr[mid] === target) return mid
      if (arr[mid] < target) lo = mid + 1
      else hi = mid - 1
    }
    return -1
  }
}

// Searcher holds a strategy reference and delegates to it
class Searcher {
  constructor(strategy) {
    this.strategy = strategy             // ← NEW: reference to strategy object
  }

  setStrategy(strategy) {               // ← NEW: swap the algorithm at runtime
    this.strategy = strategy
  }

  find(arr, target) {
    return this.strategy.search(arr, target)  // delegate — no if-else
  }
}

const searcher = new Searcher(linearSearch)
console.log(searcher.find([5, 1, 9, 3, 7], 7))  // 4, using linear

searcher.setStrategy(binarySearch)
console.log(searcher.find([1, 3, 5, 7, 9], 7))  // 3, using binary`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-meeting',
      text: 'This is where the two ideas meet. Big-O tells you when to swap algorithms: an O(n²) solution that works at n=100 may be unacceptable at n=100,000. The Strategy pattern gives you the mechanism to swap. You define the interface once — every search strategy has a search(arr, target) method — and add new strategies without changing the Searcher. The Searcher does not need to know whether it is running binary search or linear search. It just delegates to whatever strategy is currently set. Big-O is the reason you need to swap algorithms. Strategy is how you do it cleanly without rewriting every call site.',
      code: null,
    },

    // ── Challenge: Strategy ───────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-strategy',
      text: 'Create two sort strategy objects: bubbleSort and nativeSort. bubbleSort implements bubble sort — O(n²): compare adjacent pairs and swap if out of order, repeat until sorted. nativeSort wraps the built-in Array sort — O(n log n). Each strategy has a sort(arr) method that returns a sorted copy of the array without mutating the original. Then create a Sorter class that takes a strategy in its constructor and has a sort(arr) method that delegates to the strategy. Test: sort [3, 1, 4, 1, 5, 9] with both strategies and log the results.',
      expectedOutput: null,
      startCode: `const bubbleSort = {
  sort(arr) {
    const a = [...arr]   // copy so we do not mutate the original
    // implement bubble sort: compare pairs, swap if out of order, repeat
    return a
  }
}

const nativeSort = {
  sort(arr) {
    return [...arr].sort((x, y) => x - y)  // copy then sort
  }
}

class Sorter {
  constructor(strategy) {
    this.strategy = strategy
  }
  sort(arr) {
    // delegate to strategy
  }
}

const input = [3, 1, 4, 1, 5, 9]

const bubble = new Sorter(bubbleSort)
console.log(bubble.sort(input).join(','))   // 1,1,3,4,5,9

const native = new Sorter(nativeSort)
console.log(native.sort(input).join(','))   // 1,1,3,4,5,9`,
      hint: 'Bubble sort outer loop: for i 0 to n-1; inner loop: for j 0 to n-i-2; if a[j] > a[j+1] swap them. Sorter.sort: return this.strategy.sort(arr).',
      validate: ({ logs }) => {
        return logs.every(l => String(l).trim() === '1,1,3,4,5,9')
      },
    },

    { type: 'checkpoint', id: 'cp-strategy' },

    // ── Step 8: Combined ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-combined',
      text: 'Put Big-O and Strategy together in a realistic scenario: a DataProcessor that automatically selects the right algorithm based on input size. Small datasets use a simple O(n²) approach (easy to understand, fast enough). Large datasets switch to a more complex but O(n log n) approach. The switch point is configurable. The DataProcessor never contains algorithm logic — it just decides which strategy to use and delegates.',
      code: `// Two deduplication strategies with different complexities
const naiveDedup = {
  name: 'O(n²) naive',
  run(arr) {                         // O(n²): check each element against all others
    const result = []
    for (const item of arr) {
      if (!result.includes(item)) result.push(item)  // includes is O(n)
    }
    return result
  }
}

const fastDedup = {
  name: 'O(n) fast',
  run(arr) {                         // O(n): Set lookup is O(1)
    return [...new Set(arr)]
  }
}

class DataProcessor {
  constructor(threshold = 1000) {
    this.threshold = threshold       // switch strategy above this size
  }

  deduplicate(arr) {
    const strategy = arr.length <= this.threshold ? naiveDedup : fastDedup
    console.log('Using strategy:', strategy.name, 'for', arr.length, 'items')
    return strategy.run(arr)
  }
}

const processor = new DataProcessor(5)  // switch above 5 items

const small = [1, 2, 1, 3, 2]
const large = [1, 2, 1, 3, 2, 4, 3, 5, 4, 6]  // > 5 items

console.log(processor.deduplicate(small))   // uses naive
console.log(processor.deduplicate(large))   // uses fast`,
    },

    // ── Challenge: combined ───────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Complete the QueryEngine class below. It has two find strategies already defined: linearFind (O(n) — works on any array) and binaryFind (O(log n) — requires sorted array). QueryEngine.find(arr, target) should automatically choose binaryFind if the array has more than 100 items (and assume it is sorted), and linearFind otherwise. Do not hardcode the strategies inside find — store the result of the selection in a variable called strategy and then call strategy.search(arr, target). Log the result of finding 7 in a small array (use linear) and finding 500 in a large sorted array (use binary).',
      expectedOutput: null,
      startCode: `const linearFind = {
  search(arr, target) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === target) return i
    }
    return -1
  }
}

const binaryFind = {
  search(arr, target) {
    let lo = 0, hi = arr.length - 1
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (arr[mid] === target) return mid
      if (arr[mid] < target) lo = mid + 1
      else hi = mid - 1
    }
    return -1
  }
}

class QueryEngine {
  find(arr, target) {
    // if arr.length > 100 use binaryFind, else use linearFind
    // store in a variable called strategy, then call strategy.search(arr, target)
  }
}

const engine = new QueryEngine()

const small = [5, 1, 9, 3, 7]
console.log(engine.find(small, 7))                          // some index (linear)

const large = Array.from({ length: 1000 }, (_, i) => i)    // [0, 1, 2, ... 999]
console.log(engine.find(large, 500))                        // 500 (binary)`,
      hint: 'const strategy = arr.length > 100 ? binaryFind : linearFind; return strategy.search(arr, target)',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(500) && nums.some(n => n >= 0 && n < 5)
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Watch the operations counter increment for the linear search. Each iteration of the loop is one comparison. Step through until the target is found — notice how many iterations it took. Then step through the binary search for the same target: watch lo and hi converge. Each step halves the remaining range. Count how many loop iterations it takes. On 16 items, binary search takes at most 4 steps. Linear might take 16. At 1 million items, binary takes 20 steps. Linear takes up to 1 million. That gap is O(log n) vs O(n) made visible.',
      code: `let ops = 0

function linear(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    ops++
    if (arr[i] === target) return i
  }
  return -1
}

function binary(sortedArr, target) {
  let lo = 0, hi = sortedArr.length - 1
  while (lo <= hi) {
    ops++
    const mid = Math.floor((lo + hi) / 2)
    if (sortedArr[mid] === target) return mid
    if (sortedArr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

ops = 0; linear(arr, 13); console.log('linear ops:', ops)
ops = 0; binary(arr, 13); console.log('binary ops:', ops)`,
    },

    {
      type: 'codelens',
      id: 'cl-bigo-strategy',
      text: `Step through linear(arr, 13). Watch the ops counter increment on each loop iteration. Count how many times the loop body runs before returning. For target 13 in a 16-element array, it runs 13 times.

Now step through binary(arr, 13). Watch lo and hi in the Variables panel. First iteration: mid = 8, arr[8] = 9, 9 < 13 so lo becomes 9. Second: mid = 12, arr[12] = 13 — found. Two iterations instead of thirteen. That is O(log n) vs O(n) visible in the step counter.`,
      code: `let ops = 0
function linear(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    ops++
    if (arr[i] === target) return i
  }
  return -1
}
function binary(sortedArr, target) {
  let lo = 0, hi = sortedArr.length - 1
  while (lo <= hi) {
    ops++
    const mid = Math.floor((lo + hi) / 2)
    if (sortedArr[mid] === target) return mid
    if (sortedArr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}
const arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
ops = 0; linear(arr, 13); console.log('linear ops:', ops)
ops = 0; binary(arr, 13); console.log('binary ops:', ops)`,
      lang: 'js',
    },

  ],
}
