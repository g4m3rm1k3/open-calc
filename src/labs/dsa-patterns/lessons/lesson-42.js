// DSA + Design Patterns — Lesson 42
// Recursion

export const lesson = {
  id: 'dsa-patterns-42',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '42. Recursion',
  checkpoints: [
    { id: 'cp-basics',   label: 'Recursion Basics' },
    { id: 'cp-patterns', label: 'Divide & Conquer' },
    { id: 'cp-danger',   label: 'Exponential Danger' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'Recursion is when a function calls itself. That sounds circular — and it is, deliberately so. The key is that each call works on a smaller version of the same problem. The calls keep going until the problem is so small it can be solved directly, without any more calls. That point is called the base case. Without it, the function would call itself forever and crash. Every recursive function has exactly two things: a base case (the stopping condition) and a recursive case (the call to itself with a smaller input). Every single one.',
      code: null,
    },

    // ── Step 1: The call stack ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-call-stack',
      text: 'Before writing recursion, understand what happens when any function is called. The computer keeps a call stack — a LIFO (Last In, First Out) structure, like a stack of plates, that tracks active function calls. LIFO means the most recently added item is always the first one removed — this is covered fully in the Stacks lesson. When function A calls function B, a new entry for B is pushed onto the stack. When B returns, its entry is popped and control goes back to A. This happens for every function call, recursive or not. In recursion, the same function is pushed multiple times before any of them pop. Run this and watch the stack build and unwind.',
      code: `// Non-recursive first — seeing the call stack clearly
function c() {
  console.log('  c: running')
  return 3
}

function b() {
  console.log(' b: calling c')
  const result = c()
  console.log(' b: c returned', result)
  return result + 2
}

function a() {
  console.log('a: calling b')
  const result = b()
  console.log('a: b returned', result)
  return result + 1
}

console.log('final:', a())
// Stack at deepest point: a → b → c
// Then unwinds: c returns, b returns, a returns`,
    },

    // ── Step 2: Simplest recursion — countdown ────────────────────────────────

    {
      type: 'narration',
      id: 'step2-countdown',
      text: 'The simplest possible recursion: countdown. Two parts — clearly labelled. Base case: when n reaches 0, print "Done" and return. No further calls. Recursive case: print n, then call countdown(n-1). Notice n-1 is a smaller version of the same problem. Each call creates a new stack frame with its own copy of n. In CodeLens you will watch each call push a new frame and each return pop one.',
      code: `// Base case + recursive case — every recursive function has both
function countdown(n) {
  // BASE CASE: problem is small enough to solve directly
  if (n <= 0) {
    console.log('Done!')
    return
  }

  // RECURSIVE CASE: do something, then call with smaller input
  console.log(n)
  countdown(n - 1)   // n-1 is strictly smaller than n
}

countdown(5)
// prints 5, 4, 3, 2, 1, Done!`,
    },

    // ── Step 3: Factorial ─────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-factorial',
      text: 'Factorial of n (written n!) is n × (n-1) × (n-2) × ... × 1. Factorial of 5 is 5×4×3×2×1 = 120. The recursive definition: factorial(n) = n × factorial(n-1). Base case: factorial(0) = 1 by definition. Notice that the recursive call returns a value — unlike countdown, each frame does something with the result that comes back from the next frame. The call stack must unwind before any multiplication can happen. In CodeLens, watch the calls stack up without returning, then watch the multiplications happen on the way back out.',
      code: `function factorial(n) {
  // Base case — 0! = 1 by mathematical definition
  if (n === 0) return 1

  // Recursive case — n! = n × (n-1)!
  // This call WAITS for factorial(n-1) to finish before multiplying
  return n * factorial(n - 1)
}

//  factorial(4)
//    = 4 * factorial(3)
//    = 4 * (3 * factorial(2))
//    = 4 * (3 * (2 * factorial(1)))
//    = 4 * (3 * (2 * (1 * factorial(0))))
//    = 4 * (3 * (2 * (1 * 1)))   ← base case reached
//    = 4 * (3 * (2 * 1))         ← unwinding begins
//    = 4 * (3 * 2)
//    = 4 * 6
//    = 24

console.log(factorial(0))   // 1
console.log(factorial(1))   // 1
console.log(factorial(4))   // 24
console.log(factorial(6))   // 720`,
    },

    {
      type: 'challenge',
      id: 'ch-basics',
      text: 'Write a recursive function sum(n) that returns the sum of all integers from 1 to n. sum(1) = 1, sum(4) = 10 (1+2+3+4), sum(5) = 15. Log sum(5).',
      expectedOutput: '15',
      startCode: `function sum(n) {
  // base case: sum(1) = 1
  // recursive case: sum(n) = n + sum(n-1)
}

console.log(sum(1))   // 1
console.log(sum(4))   // 10
console.log(sum(5))   // 15`,
      hint: 'if (n === 1) return 1. else return n + sum(n - 1).',
      validate: ({ logs }) => logs.some(l => String(l).trim() === '15'),
    },

    { type: 'checkpoint', id: 'cp-basics' },

    // ── Step 4: Divide and conquer — binary search ────────────────────────────

    {
      type: 'narration',
      id: 'step4-binary-search',
      text: 'Divide and conquer is a recursive strategy: split the problem in half, solve each half, combine. Binary search is the clearest example. Given a sorted array, check the middle element. If it equals the target, done. If the target is smaller, search only the left half. If larger, search only the right half. Each recursive call eliminates half the remaining elements. That is O(log n) — the best possible for a search problem. A sorted array of 1 billion items needs at most 30 comparisons.',
      code: `// Binary search — O(log n) by dividing in half each time
function binarySearch(arr, target, low = 0, high = arr.length - 1) {
  // Base case 1: search space is exhausted — not found
  if (low > high) return -1

  const mid = Math.floor((low + high) / 2)

  // Base case 2: found it
  if (arr[mid] === target) return mid

  // Recursive case: search the appropriate half
  if (target < arr[mid]) {
    return binarySearch(arr, target, low, mid - 1)   // left half
  } else {
    return binarySearch(arr, target, mid + 1, high)  // right half
  }
}

const sorted = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]

console.log(binarySearch(sorted, 23))   // index 5
console.log(binarySearch(sorted, 2))    // index 0
console.log(binarySearch(sorted, 91))   // index 9
console.log(binarySearch(sorted, 50))   // -1 (not found)`,
    },

    // ── Step 5: Recursive flatten ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-flatten',
      text: 'Flattening a nested array is a problem that cannot easily be done without recursion (or a stack). Given [1, [2, [3, 4]], 5], produce [1, 2, 3, 4, 5]. For each element: if it is a plain value, add it to the result. If it is an array, flatten it recursively and add its elements. The depth of nesting is not known in advance — recursion handles any depth automatically.',
      code: `// Flatten deeply nested arrays — depth unknown at write time
function flatten(arr) {
  const result = []

  for (const item of arr) {
    if (Array.isArray(item)) {
      // Recursive case: item is an array — flatten it and spread into result
      const flattened = flatten(item)
      for (const x of flattened) result.push(x)
    } else {
      // Base case: item is a plain value — add directly
      result.push(item)
    }
  }

  return result
}

console.log(flatten([1, 2, 3]))                     // [1, 2, 3]
console.log(flatten([1, [2, 3], 4]))                // [1, 2, 3, 4]
console.log(flatten([1, [2, [3, [4, [5]]]]]))       // [1, 2, 3, 4, 5]
console.log(flatten([[1,2],[3,[4,5]],[6]]))          // [1, 2, 3, 4, 5, 6]`,
    },

    {
      type: 'challenge',
      id: 'ch-patterns',
      text: 'Write a recursive power(base, exp) function that computes base to the power of exp without using Math.pow. power(2, 0) = 1, power(2, 3) = 8, power(3, 4) = 81. Base case: anything to the power of 0 is 1.',
      expectedOutput: null,
      startCode: `function power(base, exp) {
  // base case: exp === 0 → return 1
  // recursive case: base * power(base, exp - 1)
}

console.log(power(2, 0))   // 1
console.log(power(2, 3))   // 8
console.log(power(3, 4))   // 81
console.log(power(5, 2))   // 25`,
      hint: 'if (exp === 0) return 1. else return base * power(base, exp - 1).',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(1) && nums.includes(8) && nums.includes(81) && nums.includes(25)
      },
    },

    { type: 'checkpoint', id: 'cp-patterns' },

    // ── Step 6: Fibonacci — the exponential danger ────────────────────────────

    {
      type: 'narration',
      id: 'step6-fib-bad',
      text: 'Not all recursive solutions are fast. Fibonacci is the famous example of recursion going wrong. The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13 ... Each number is the sum of the two before it. The naive recursive definition looks elegant: fib(n) = fib(n-1) + fib(n-2). But run this and watch how slow it gets. fib(40) requires over a billion function calls. The problem: the same subproblems are computed over and over.',
      code: `// Naive fibonacci — correct but exponentially slow
function fib(n) {
  if (n <= 1) return n                   // base cases: fib(0)=0, fib(1)=1
  return fib(n - 1) + fib(n - 2)        // two recursive calls!
}

// Each call spawns two more. The call tree doubles in size for each step.
// fib(5) requires: fib(4) + fib(3)
//   fib(4) requires: fib(3) + fib(2)   ← fib(3) computed TWICE
//     fib(3) requires: fib(2) + fib(1)
// ...

console.log(fib(0))   // 0
console.log(fib(1))   // 1
console.log(fib(10))  // 55
console.log(fib(20))  // 6765
// fib(40) ≈ 1 billion calls — DO NOT run without memoization`,
    },

    // ── Step 7: Memoised fibonacci ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-memoize',
      text: 'The fix is memoization — store each result the first time it is computed. On the second request for the same input, return the stored answer immediately without recomputing. This turns the exponential tree into a single straight chain: fib(n) computes fib(n-1), then fib(n-2) is already in the cache — a plain object or hash table used as a lookup store. This connects directly to the memoize() function from the Hash Tables lesson. We can use a plain JavaScript object as the cache. Either way, the cost drops from O(2ⁿ) to O(n).',
      code: `// Memoised fibonacci — O(n) instead of O(2ⁿ)
function memoFib() {
  const cache = {}   // key: n, value: fib(n)

  function fib(n) {
    if (n <= 1) return n

    // Check cache before computing
    if (cache[n] !== undefined) return cache[n]

    // Compute, store, return
    cache[n] = fib(n - 1) + fib(n - 2)
    return cache[n]
  }

  return fib
}

const fib = memoFib()

console.log(fib(10))   // 55     — computed
console.log(fib(10))   // 55     — instant from cache
console.log(fib(30))   // 832040 — computed in 30 steps, not 1 billion
console.log(fib(40))   // 102334155 — would have been impossible; now instant`,
    },

    // ── Step 8: Iterative vs recursive ───────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-when',
      text: 'Recursion is powerful but not always the right tool. Use recursion when the problem is naturally self-similar (trees, graphs, nested structures) or when divide-and-conquer splits it cleanly. Use iteration when the algorithm is flat and linear — summing an array, building a string. Recursion uses stack space for each call. Deep recursion (thousands of levels) can exhaust the call stack and crash. JavaScript has no tail call optimisation in most environments, so if you need to recurse thousands of times, convert to a loop. The memoised fibonacci is a good example of when a loop is actually cleaner.',
      code: `// The same fibonacci three ways — choose the clearest for the context

// 1. Recursive (clear intent, bad for large n without memo)
function fibRecursive(n, memo = {}) {
  if (n <= 1) return n
  if (memo[n]) return memo[n]
  memo[n] = fibRecursive(n-1, memo) + fibRecursive(n-2, memo)
  return memo[n]
}

// 2. Iterative (O(n) time, O(1) space — best for large n)
function fibIterative(n) {
  if (n <= 1) return n
  let prev = 0, curr = 1
  for (let i = 2; i <= n; i++) {
    const next = prev + curr
    prev = curr
    curr = next
  }
  return curr
}

// Both give the same results — choose based on context
console.log(fibRecursive(10))   // 55
console.log(fibIterative(10))   // 55
console.log(fibIterative(50))   // 12586269025 — no stack overflow`,
    },

    {
      type: 'challenge',
      id: 'ch-danger',
      text: 'Write a memoized countDown(n) that counts from n down to 1, but only computes the path from n to any already-computed point once. For this challenge: write a recursive function that sums all numbers from 1 to n, but caches intermediate results. Call it three times with 100, 100, and 50. Log all three results. The second call to 100 should be instant from cache.',
      expectedOutput: null,
      startCode: `function memoSum() {
  const cache = {}

  function sum(n) {
    if (n === 1) return 1
    // check cache first
    // if not cached: compute, store, return
  }

  return sum
}

const sum = memoSum()
console.log(sum(100))   // 5050
console.log(sum(100))   // 5050 (cached)
console.log(sum(50))    // 1275`,
      hint: 'if (cache[n] !== undefined) return cache[n]. Then cache[n] = n + sum(n-1); return cache[n].',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.filter(n => n === 5050).length >= 2 && nums.includes(1275)
      },
    },

    { type: 'checkpoint', id: 'cp-danger' },

    // ── CodeLens ──────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. This is the most valuable CodeLens in the series. Step through factorial(4) one line at a time. Watch the call stack panel on the left: you will see factorial called with 4, then 3, then 2, then 1, then 0. Four levels of stack frames, each with its own n. Then watch them pop off one by one as the multiplications happen. This visual is exactly what beginners need to understand recursion — the build-up and the unwind.',
      code: `function factorial(n) {
  if (n === 0) return 1
  return n * factorial(n - 1)
}

function fib(n, memo = {}) {
  if (n <= 1) return n
  if (memo[n]) return memo[n]
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
  return memo[n]
}

console.log(factorial(4))   // 24
console.log(fib(8))         // 21`,
    },

    {
      type: 'codelens',
      id: 'cl-recursion',
      text: 'Step through factorial(4) in CodeLens. Watch the call stack grow to 5 levels deep (factorial 4, 3, 2, 1, 0) then unwind. Each level holds its own value of n. See how the multiplications only happen during the unwind — the function cannot return a value until the deepest call resolves first.',
      code: `function factorial(n) {
  if (n === 0) return 1
  return n * factorial(n - 1)
}

function fib(n, memo = {}) {
  if (n <= 1) return n
  if (memo[n]) return memo[n]
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
  return memo[n]
}

console.log(factorial(4))
console.log(fib(8))`,
      lang: 'js',
    },

  ],
}
