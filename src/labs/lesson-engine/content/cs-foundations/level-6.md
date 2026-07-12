---
series: cs-foundations
level: 6
title: Recursion and Its Cost
lang: javascript
---

# Recursion and Its Cost

Recursion is one of the most powerful ideas in computer science: a function that solves a problem by solving a smaller version of the same problem, until the problem is small enough to solve directly. It is how compilers parse nested expressions, how filesystems traverse directories, how interpreters evaluate code, and how the fastest sorting algorithms work.

But recursion is not free. Each recursive call pushes a stack frame. Too many frames overflow the stack. Redundant recursive calls recompute the same values exponentially. Understanding the cost of recursion — and the techniques that eliminate it — is what separates using recursion correctly from using it dangerously.

By the end of this lesson you will be able to write recursive functions with correct base cases and recursive cases, calculate the time complexity of recursive functions, recognise when recursion is expensive (and why), and apply memoisation to eliminate redundant work.

## The anatomy of a recursive function

Every recursive function has exactly two parts. Without both, the function is wrong.

```text
BASE CASE:      The condition under which the function does NOT recurse.
                Without this, the function recurses forever → stack overflow.
                The base case must be reachable from any valid input.

RECURSIVE CASE: The call to itself with a SMALLER input.
                "Smaller" means: closer to the base case with each call.
                Without this property, the function never reaches the base case.
```

```javascript
// Factorial: n! = n × (n-1) × (n-2) × ... × 1.  0! = 1 by definition.

function factorial(n) {
  if (n === 0) return 1          // BASE CASE: factorial(0) = 1 (no recursion)
  return n * factorial(n - 1)   // RECURSIVE CASE: n! = n × (n-1)!
}
```

```text
factorial(4) trace:

  factorial(4) → 4 × factorial(3)
    factorial(3) → 3 × factorial(2)
      factorial(2) → 2 × factorial(1)
        factorial(1) → 1 × factorial(0)
          factorial(0) → 1               (base case — returns directly)
        factorial(1) → 1 × 1 = 1
      factorial(2) → 2 × 1 = 2
    factorial(3) → 3 × 2 = 6
  factorial(4) → 4 × 6 = 24

Stack depth at deepest point: 5 frames (factorial 4, 3, 2, 1, 0).
For factorial(n): stack depth = n + 1.
factorial(100000) → 100001 frames → stack overflow.
```

**CS lens:** The recursion-iteration equivalence theorem states that any recursive function can be rewritten as an iterative function, and vice versa. Recursion is not a unique capability — it is a particular expression of control flow. The reason recursion is useful despite this is elegance and clarity: the recursive definition of factorial, tree traversal, or binary search often matches the mathematical definition exactly, making the code easier to reason about than the iterative version. The tradeoff is stack usage.

## The cost of naive recursion: Fibonacci

The canonical example of exponentially expensive recursion is the naive recursive Fibonacci.

```javascript
// Fibonacci: fib(n) = fib(n-1) + fib(n-2). fib(0) = 0, fib(1) = 1.

function fib(n) {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
}
```

```text
Call tree for fib(5):

  fib(5)
  ├── fib(4)
  │   ├── fib(3)
  │   │   ├── fib(2)
  │   │   │   ├── fib(1) → 1
  │   │   │   └── fib(0) → 0
  │   │   └── fib(1) → 1
  │   └── fib(2)
  │       ├── fib(1) → 1
  │       └── fib(0) → 0
  └── fib(3)
      ├── fib(2)
      │   ├── fib(1) → 1
      │   └── fib(0) → 0
      └── fib(1) → 1

Total calls: 15 for fib(5)
  fib(3) is computed TWICE
  fib(2) is computed THREE TIMES
  fib(1) is computed FIVE TIMES

Time complexity: O(2ⁿ)
  fib(30) → ~1 billion calls
  fib(50) → ~1 quadrillion calls — will run for years
```

## Memoisation: eliminating redundant work

Memoisation stores the result of a function call the first time it is computed, and returns the stored result on subsequent calls with the same input. It converts an exponential algorithm into a linear one.

```javascript
// Memoised Fibonacci: compute each fib(n) exactly once
function fibMemo(n, memo = new Map()) {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)   // already computed — return cached result

  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  memo.set(n, result)                    // store before returning
  return result
}
```

```text
fibMemo(5) call trace:

  fibMemo(5): not in memo → recurse
  fibMemo(4): not in memo → recurse
  fibMemo(3): not in memo → recurse
  fibMemo(2): not in memo → recurse
  fibMemo(1): base case → 1
  fibMemo(0): base case → 0
  fibMemo(2) = 1. Store in memo.
  fibMemo(3) = 2. Store in memo.
  fibMemo(4) = 3. Store in memo.
  fibMemo(5) = 5. Store in memo.

Each value computed ONCE.
  fib(2) was called 3 times in the naive version → 1 time with memo.
  fib(3) was called 2 times → 1 time.
  Total calls: 9 (vs 15 without memo).

For fib(30): naive O(2³⁰) = ~1 billion calls. Memo: 31 calls. O(n).
```

**CS lens:** Memoisation is the canonical example of the **time-space tradeoff**: by spending O(n) extra memory (the memo table), you reduce time from O(2ⁿ) to O(n). The same idea, applied systematically to break problems into sub-problems and store their results, is called **dynamic programming** — one of the most important algorithm design techniques. Every dynamic programming solution is either a memoised recursion (top-down) or an iterative solution that fills a table in a deliberate order (bottom-up).

## Tail recursion: recursion without stack growth

A tail-recursive function is one where the recursive call is the last operation — there is nothing left to do after it returns. A tail-recursive call can be optimised by the runtime to reuse the current stack frame instead of pushing a new one.

```javascript
// NOT tail-recursive: must wait for recursive call, then multiply
function factorial(n) {
  if (n === 0) return 1
  return n * factorial(n - 1)   // multiplication happens AFTER recursive return
}
// Stack frames: factorial(5) → factorial(4) → ... → factorial(0) = 5 frames pending

// TAIL-RECURSIVE: accumulator carries the result; recursive call is last
function factorialTail(n, acc = 1) {
  if (n === 0) return acc
  return factorialTail(n - 1, acc * n)   // last operation — nothing pending after
}
// A tail-call-optimised runtime reuses the same stack frame. O(1) stack space.
```

```text
factorialTail(4, 1) trace:
  factorialTail(4, 1)   → acc=1,  n=4 → tail call factorialTail(3, 4)
  factorialTail(3, 4)   → acc=4,  n=3 → tail call factorialTail(2, 12)
  factorialTail(2, 12)  → acc=12, n=2 → tail call factorialTail(1, 24)
  factorialTail(1, 24)  → acc=24, n=1 → tail call factorialTail(0, 24)
  factorialTail(0, 24)  → base case → return 24

With tail-call optimisation (TCO):
  Only ONE stack frame exists at any time — it is reused for each call.
  No stack overflow, regardless of n.

JavaScript note: TCO is part of the ES6 specification but is only implemented
by Safari. In most JavaScript runtimes, factorialTail(100000) still overflows.
Use iteration when stack depth is a concern in JavaScript.
```

**SE lens:** The practical rule for recursion in JavaScript: recursion is excellent for naturally hierarchical problems (tree traversal, parsing nested structures, directory recursion) where depth is bounded and predictable (depth < ~10,000). For unbounded depth, or for operations that could run on arbitrarily large inputs, use iteration. The elegance of recursion is not worth a stack overflow in production.

**Common mistakes:**
- Missing the base case — the most common recursion bug. The function runs until the stack is full instead of returning a value.
- Returning the recursive call's result but also doing something after — `return 1 + recurse(n-1)` is NOT tail-recursive because the `+1` must be performed after the recursive call returns.
- Using recursion where iteration is clearer — a loop over an array does not need recursion. Recursion earns its place when the problem is naturally recursive (trees, nested structures, divide-and-conquer).

**Debug tip:** When debugging recursive functions, add depth tracking: `function fn(n, depth = 0) { console.log(' '.repeat(depth) + n); ... fn(n-1, depth+1) }`. The indented output shows the call tree, revealing whether the recursion is exploring the right structure and what the base case produces.

## Challenge: memoised_power

Implement `power(base, exp)` first recursively, then add memoisation. The function returns `base` raised to the `exp` power. Use the fast exponentiation rule: `power(b, n) = power(b, n/2)² when n is even`, which is O(log n) without memoisation.

```challenge
const powerMemo = new Map()

function power(base, exp) {
  // Base cases: exp === 0 → 1, exp === 1 → base
  // Recursive case: if exp is even → power(base, exp/2) ** 2
  //                 if exp is odd  → base * power(base, exp - 1)
  // Use powerMemo to avoid recomputing the same (base, exp) pair.
  const key = `${base},${exp}`
  if (powerMemo.has(key)) return powerMemo.get(key)
  // TODO: implement the recursive cases
}
```

```test
assert power(2, 0)  === 1
assert power(2, 1)  === 2
assert power(2, 10) === 1024
assert power(3, 4)  === 81
assert power(5, 3)  === 125
assert power(2, 20) === 1048576
```
