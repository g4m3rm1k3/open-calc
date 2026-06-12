# FOUNDATIONS — LAB-008 — Recursion

**Series:** FOUNDATIONS — Part II: Programming Fundamentals
**Environment:** Browser DevTools console (F12 → Console). No install required.
**Time:** 60–80 minutes.

---

## What You Will Build

A set of recursive functions that you trace by hand and verify in the browser console: `factorial(n)` that computes n! by multiplying down to 1, `fibonacci(n)` that computes the nth Fibonacci number, and `flatten(arr)` that recursively unrolls a deeply nested array of unknown depth into a flat list. After completing this lab, you will be able to look at any recursive function, identify its base case and recursive case, trace the call stack by hand, and predict both its output and whether it will overflow the stack.

---

## What You Need to Know First

**From LAB-001 (The Call Stack and the Heap):** Every function call creates a stack frame pushed onto the call stack. When the function returns, its frame is popped. The stack has a finite size. Calling too many nested functions without returning overflows it.

**From LAB-006 (First-Class Functions):** Functions are values. A function can call another function — including itself. Nothing in the language prevents this.

If you have not done LAB-001, the one thing you must understand before continuing: when `f()` calls `g()`, the call to `f` is paused and a new frame for `g` is pushed on top. When `g` returns, `g`'s frame is popped and `f` resumes where it paused. Recursion is `f()` calling itself — the same mechanics, just with the same function stacked up multiple times.

---

> **Quick Check — try to answer before reading:**
>
> 1. If `f()` calls `f()` which calls `f()` infinitely — what happens to the call stack? What error do you eventually see?
> 2. A function computes the sum of a list: "the sum of `[3, 1, 4, 1, 5]` is `3` plus the sum of `[1, 4, 1, 5]`." Which element is the "smaller problem"? What is the smallest possible list this definition breaks down on?
> 3. `factorial(5)` is `5 × 4 × 3 × 2 × 1`. If you write this as "5 times factorial(4)", what is `factorial(0)`?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — What Makes a Function Recursive

**The problem this step solves:** Understand what recursion is before writing any of it.

**The code:**

```js
function countdown(n) {
  console.log(n);
  countdown(n - 1);   // calls itself with a smaller argument
}
```

Paste this in the console and call `countdown(3)`.

**Stop. Do NOT press Enter yet.** Predict what happens first.

Now run it.

**The walkthrough — what actually executes:**

1. `countdown(3)` is called. A stack frame is created for this call. `n = 3`. `console.log(3)` prints `3`.
2. `countdown(2)` is called. A new stack frame is pushed. `n = 2`. `console.log(2)` prints `2`.
3. `countdown(1)` is called. Another frame pushed. `n = 1`. Prints `1`.
4. `countdown(0)` is called. Another frame. `n = 0`. Prints `0`.
5. `countdown(-1)`, `countdown(-2)`, `countdown(-3)` ... the stack grows until it exhausts the fixed amount of memory reserved for the call stack.
6. The browser throws: `Uncaught RangeError: Maximum call stack size exceeded`.

This is called a **stack overflow** — the call stack ran out of space. The word "overflow" is literal: the stack grew past its allocated memory boundary.

**CS lens — what concept this code embodies:**

This is an **infinite recursion** — a recursive call with no stopping condition. Every recursive solution requires two things:

- A **base case**: the smallest input where the answer is known directly, without recursion.
- A **recursive case**: the general case that makes the problem smaller and calls itself.

`countdown` has a recursive case (call self with `n - 1`) but no base case. It recurses forever.

**SE lens — why this matters to the system:**

Without a base case, every recursive function is a bug. The base case is not an optimisation — it is the contract that promises the recursion terminates. When you write a recursive function and it throws `RangeError`, the first question is always: "does my base case cover all inputs, including edge cases like 0, negative numbers, and empty arrays?"

**What breaks without this:**

The stack overflow above IS the failure. In production code, an uncaught `RangeError` crashes a Node.js server. In a browser, it terminates the script silently in older engines. The callstack-depth limit is around 10,000–15,000 in V8 (Chrome's JavaScript engine) — enough for most uses, but not for processing large data recursively.

---

### SAVE AND TRY

```js
function countdown(n) {
  if (n < 0) return;   // base case: stop when n goes negative
  console.log(n);
  countdown(n - 1);
}

countdown(5);
```

Expected output: `5 4 3 2 1 0` — one number per line.

The `if (n < 0) return;` is the base case. When `n` reaches `-1`, the function returns immediately without printing or recursing. The stack starts unwinding: all the paused `countdown` calls return in reverse order.

**Change something:** Change `if (n < 0)` to `if (n <= 0)`. Expected: `5 4 3 2 1` — stops at 1, does not print 0. What if you change it to `if (n <= 3)`? Expected: `5 4` — stops before 3.

---

### Step 2 — Factorial: The Classic Recursive Definition

**The problem this step solves:** Write a useful recursive function with a clear base case and see how the return values chain together.

**The mathematical definition:**

```
factorial(0) = 1              ← base case: factorial of zero is one by definition
factorial(n) = n × factorial(n - 1)   ← recursive case: n! = n × (n-1)!
```

This is called an **inductive definition** — the same structure as mathematical induction. The base case is `factorial(0) = 1`. Every other case is defined in terms of a smaller case.

**The code:**

```js
function factorial(n) {
  if (n === 0) return 1;            // base case
  return n * factorial(n - 1);      // recursive case
}
```

**The walkthrough — tracing `factorial(4)` on the call stack:**

```
factorial(4) called   → 4 × factorial(3) ... waiting for factorial(3)
  factorial(3) called → 3 × factorial(2) ... waiting for factorial(2)
    factorial(2) called → 2 × factorial(1) ... waiting for factorial(1)
      factorial(1) called → 1 × factorial(0) ... waiting for factorial(0)
        factorial(0) called → returns 1   ← base case: answer is known immediately

Now unwind:
      factorial(1) returns 1 × 1 = 1
    factorial(2) returns 2 × 1 = 2
  factorial(3) returns 3 × 2 = 6
factorial(4) returns 4 × 6 = 24
```

The call stack grows **down** during recursion and shrinks **up** during the return phase. The base case is what turns the direction around: it returns a known value, which allows the frame above it to complete its multiplication, which allows the frame above *that* to complete, and so on until the original call returns.

**CS lens — what concept this code embodies:**

This is **divide and conquer** at its simplest: reduce the problem to a smaller version of itself, solve the smaller version, and combine the result. The single responsibility of each call is: "multiply my `n` by whatever comes back from below."

**SE lens — why this design:**

The recursive definition mirrors the mathematical definition exactly. When a problem has a recursive mathematical definition, a recursive function is the most direct expression of that definition. The code is not a clever trick — it is a literal transcription of the math. This alignment between the specification and the implementation is why recursion is valuable: it eliminates the gap between "what we want" and "how we get it."

**What breaks without the base case:**

Remove `if (n === 0) return 1;` and call `factorial(4)`. What happens?

`factorial(4) → 4 × factorial(3) → 4 × 3 × factorial(2) → ... → factorial(-∞)` — it recurses past 0 and goes negative forever. Stack overflow.

---

### SAVE AND TRY

```js
function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(0));   // → 1
console.log(factorial(1));   // → 1
console.log(factorial(5));   // → 120
console.log(factorial(10));  // → 3628800
```

Verify `factorial(5)` by hand: 5 × 4 × 3 × 2 × 1 = 120. Confirmed.

**Change something:** Try `factorial(-1)`. What happens? (Infinite recursion — the base case `n === 0` is never hit.) Now add a guard: `if (n < 0) throw new Error("factorial is not defined for negative numbers");` before the base case. Try `factorial(-1)` again — expected: an error message, not a stack overflow.

---

### Step 3 — Fibonacci: Two Recursive Calls

**The problem this step solves:** Handle a recursive definition that makes two recursive calls, and understand why this multiplies the work exponentially.

**The mathematical definition:**

```
fibonacci(0) = 0                              ← base case
fibonacci(1) = 1                              ← base case
fibonacci(n) = fibonacci(n-1) + fibonacci(n-2)  ← recursive case
```

The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55 ...

**The code:**

```js
function fibonacci(n) {
  if (n === 0) return 0;           // base case 1
  if (n === 1) return 1;           // base case 2
  return fibonacci(n - 1) + fibonacci(n - 2);   // two recursive calls
}
```

**The walkthrough — tracing `fibonacci(4)`:**

```
fibonacci(4)
├── fibonacci(3)
│   ├── fibonacci(2)
│   │   ├── fibonacci(1) → 1
│   │   └── fibonacci(0) → 0
│   │   returns 1 + 0 = 1
│   └── fibonacci(1) → 1
│   returns 1 + 1 = 2
└── fibonacci(2)
    ├── fibonacci(1) → 1
    └── fibonacci(0) → 0
    returns 1 + 0 = 1
returns 2 + 1 = 3
```

`fibonacci(4) = 3`. The call tree fans out — each call splits into two. Notice that `fibonacci(2)` is computed **twice**: once on the left branch and once on the right. `fibonacci(1)` is computed three times.

**CS lens — exponential time complexity:**

This naive implementation is `O(2ⁿ)` — **exponential** time complexity. Each additional `n` roughly doubles the work. `fibonacci(50)` would require approximately 2⁵⁰ ≈ 1 quadrillion function calls. Do not run it.

Run this instead:

```js
let callCount = 0;
function fibSlow(n) {
  callCount++;
  if (n <= 1) return n;
  return fibSlow(n - 1) + fibSlow(n - 2);
}

callCount = 0; fibSlow(10); console.log("calls for fib(10):", callCount);
callCount = 0; fibSlow(20); console.log("calls for fib(20):", callCount);
callCount = 0; fibSlow(30); console.log("calls for fib(30):", callCount);
```

Observe: each increment of 10 roughly multiplies the call count by 100. This is the exponential curve in action.

**SE lens — the performance obligation:**

When a recursive function recomputes the same subproblem multiple times, it is performing redundant work. The fix — storing each subproblem's result and reusing it — is called **memoization**. You implemented memoize in LAB-007. Here is how it applies:

```js
function memoize(fn) {
  const cache = {};
  return function(arg) {
    if (arg in cache) return cache[arg];
    const result = fn(arg);
    cache[arg] = result;
    return result;
  };
}

// This only works if fibFast does not call fibSlow — it must call itself:
const fibFast = memoize(function fibFastInner(n) {
  if (n <= 1) return n;
  return fibFast(n - 1) + fibFast(n - 2);   // calls memoized version
});
```

Run `fibFast(50)` — instant. The memoized version runs in `O(n)` because each subproblem is computed exactly once. The call tree becomes a straight line instead of a branching tree. **This is the core idea of dynamic programming, which you will study formally in LAB-033.**

**What breaks without both base cases:**

Remove `if (n === 0) return 0;` — only leave the `n === 1` case. Call `fibonacci(2)`.

`fibonacci(2) → fibonacci(1) + fibonacci(0)`. `fibonacci(1)` hits the base case and returns 1. `fibonacci(0)` does not — it recurses: `fibonacci(-1) + fibonacci(-2)`, then `fibonacci(-2) + fibonacci(-3)`, forever. Missing one base case causes a stack overflow even when the other is present.

---

### SAVE AND TRY

```js
function fibonacci(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(6));   // → 8
console.log(fibonacci(10));  // → 55
```

Verify `fibonacci(6)` by hand: 0,1,1,2,3,5,**8**. The 6th index (0-based) is 8. Confirmed.

**Change something:** Run `fibonacci(25)` — it runs, but takes a moment. Run `fibonacci(35)` — noticeably slower. Do not run `fibonacci(50)`. Now try the memoized version above. `fibFast(50)` should return `12586269025` instantly.

---

### Step 4 — Recursion on Trees: `flatten`

**The problem this step solves:** See a case where recursion is the natural solution because the problem structure itself is recursive — nested arrays.

**Why this example matters:**

Many real data structures are recursive: file systems (a directory contains files and directories), HTML (an element contains elements), JSON (an object can contain objects), and syntax trees (an expression can contain expressions). Recursion is the natural tool whenever the data contains more of itself.

**The problem stated:**

```js
const nested = [1, [2, 3], [4, [5, [6]]]];
// Goal: [1, 2, 3, 4, 5, 6]
```

The input is an array whose elements can themselves be arrays, which can themselves contain arrays, to arbitrary depth. A loop with a fixed number of iterations cannot solve this because the depth is unknown.

**The code:**

```js
function flatten(arr) {
  const result = [];

  for (const element of arr) {
    if (Array.isArray(element)) {
      const flattenedElement = flatten(element);   // recursive case: element is an array
      for (const item of flattenedElement) {
        result.push(item);
      }
    } else {
      result.push(element);   // base case: element is not an array, just add it
    }
  }

  return result;
}
```

**Note on names:** `Array.isArray(element)` — this is a built-in JavaScript function. It accepts any value and returns `true` if the value is an Array, `false` otherwise. It is more reliable than `typeof` (which returns `"object"` for arrays, functions, null, and actual objects) or `instanceof Array` (which can give wrong answers across different JavaScript realms, such as iframes). For checking whether a value is an array, `Array.isArray` is always the right choice.

**The walkthrough — tracing `flatten([1, [2, 3]])`:**

1. `flatten([1, [2, 3]])` called. `result = []`.
2. First element: `1`. Not an array. `result.push(1)`. `result = [1]`.
3. Second element: `[2, 3]`. IS an array. Call `flatten([2, 3])` recursively.
   - Inner call: `result = []`.
   - Element `2`: not an array. Push. `result = [2]`.
   - Element `3`: not an array. Push. `result = [2, 3]`.
   - Returns `[2, 3]`.
4. Back in outer call: `flattenedElement = [2, 3]`. Push each item. `result = [1, 2, 3]`.
5. Returns `[1, 2, 3]`.

**CS lens — what concept this code embodies:**

This is **structural recursion** — recursion that mirrors the structure of the data. The data structure (a nested array) is defined recursively: an array contains elements, and each element is either a value or an array. The recursive function follows exactly this definition: handle a value directly (base case), recurse into an array (recursive case). When data is recursively defined, recursive functions are the natural and correct solution. Iterative solutions to this problem require an explicit stack (which is exactly what the call stack is — you would be reimplementing it manually).

**SE lens — why not just use `arr.flat(Infinity)`?**

JavaScript has a built-in `arr.flat(Infinity)` that flattens arrays. We implement it manually here because the goal is to understand the mechanism. In production code, use the built-in. But when you encounter a similar problem with a recursive data structure you cannot use a library for — a custom tree, a file system traversal, an AST walk — you will use exactly this pattern.

**What breaks without this:**

Without `Array.isArray(element)`, if you try to call `result.push(element)` for everything, you will push arrays as single elements: `[1, [2,3], [4,[5]]]` would remain as-is because no flattening occurs. Without recursion — if you call `flatten` on `element` but do not recurse into the returned array — nested arrays deeper than one level remain nested.

---

### SAVE AND TRY

```js
function flatten(arr) {
  const result = [];
  for (const element of arr) {
    if (Array.isArray(element)) {
      for (const item of flatten(element)) {
        result.push(item);
      }
    } else {
      result.push(element);
    }
  }
  return result;
}

console.log(flatten([1, [2, 3], [4, [5, [6]]]]));
// → [1, 2, 3, 4, 5, 6]

console.log(flatten([]));
// → []  (base case of empty array: the for loop runs zero times, returns [])

console.log(flatten([[[[[42]]]]]));
// → [42]  (any depth of nesting)
```

**Change something:** Try `flatten([1, [2, [3, [4, [5]]]], 6])` — expected `[1, 2, 3, 4, 5, 6]`. Try `flatten([])` — expected `[]`. The empty array is handled naturally: the `for` loop runs zero times and `result` remains empty. This is the implicit base case — no explicit check needed because iteration over an empty array does nothing.

---

### Step 5 — The Call Stack for Recursion (Connecting to LAB-001)

**The problem this step solves:** Visually confirm that recursive calls push and pop frames exactly like regular function calls.

In LAB-001 you saw the call stack in DevTools. Now open it for a recursive call.

**The code:**

```js
function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}
```

Open DevTools (F12). Go to **Sources** tab. Find this code (paste it into a Snippet: Sources → Snippets → New Snippet → paste → right-click → Run). Add a breakpoint on the `if (n === 0)` line by clicking the line number.

Run `factorial(5)`. The debugger pauses when `n` reaches 0.

**What to look at:**

In the **Call Stack** panel on the right, you will see:

```
factorial  (n = 0)   ← current frame, at the top
factorial  (n = 1)   ← waiting for factorial(0) to return
factorial  (n = 2)   ← waiting for factorial(1) to return
factorial  (n = 3)   ← waiting for factorial(2) to return
factorial  (n = 4)   ← waiting for factorial(3) to return
factorial  (n = 5)   ← the original call
(anonymous)          ← the console call
```

Six frames of `factorial` stacked on top of each other. Each frame has its own `n`. Click on different frames — the **Scope** panel shows the local `n` for that specific call.

Press **Resume** (or F8). The debugger exits. All six frames return and pop in reverse order.

**CS lens — the call stack IS the implicit return stack:**

When a recursive function makes its next call, the current frame is suspended — it is not removed, it is paused. The frame stays on the stack holding the value of `n` at that depth. The return value of `factorial(n-1)` is what allows the suspended frame to complete its `n * ...` multiplication. This is why recursive algorithms do not need an explicit stack to remember intermediate values: the call stack *is* that stack, and it is maintained automatically by the runtime.

**SE lens — when recursion becomes a memory concern:**

Each stack frame consumes memory. For `factorial(n)`, the stack depth equals `n`. For `n = 10`, 10 frames. For `n = 10,000`, 10,000 frames — likely a stack overflow. This is why recursive algorithms on large inputs are replaced with iterative ones that use an explicit stack data structure on the heap (where memory is not bounded the same way). **You will do this in LAB-027 (Stacks and Queues).**

---

### SAVE AND TRY

```js
// Demonstrate stack depth:
function depth(n) {
  if (n === 0) {
    console.trace("at base case");  // prints the call stack to the console
    return 0;
  }
  return 1 + depth(n - 1);
}

depth(5);
```

`console.trace(message)` — a built-in function that prints the current call stack to the console, prefixed by the message. It does not pause execution (unlike a breakpoint). It is useful for understanding where you are in the call hierarchy without opening the debugger.

Expected: the trace shows `depth` called 6 times (`depth(5)`, `depth(4)`, `depth(3)`, `depth(2)`, `depth(1)`, `depth(0)`).

**Change something:** Call `depth(10)`. The trace shows 11 frames. Call `depth(3)` — 4 frames. Notice the pattern: `depth(n)` produces `n+1` frames (n recursive calls plus the base case call).

---

## Connect the Pieces

**What you built:** Three recursive functions (`factorial`, `fibonacci`, `flatten`) plus the trace-based understanding of how the call stack grows and unwinds during recursion.

**How it connects to LAB-001:** In LAB-001 you saw the call stack in DevTools and understood that each function call pushes a frame. Recursion is not a special case — it is the same mechanism. Recursive calls push frames exactly like ordinary calls. The difference is that the same function name appears multiple times in the stack. Each frame is completely independent: `factorial(3)` and `factorial(2)` on the stack are two separate frames with two separate values of `n`.

**How it connects to LAB-006:** The `memoize(fn)` function from LAB-007 works on recursive functions exactly as it works on any function. You applied it to `fibonacci` to convert an `O(2ⁿ)` algorithm to `O(n)`. This is the closure-based memoization pattern from LAB-007, applied in a new context — the concept locked in here confirms it works in non-trivial situations.

**How it connects forward:**

- **LAB-027 (Stacks and Queues):** You will convert a recursive tree traversal to an iterative one by managing the stack explicitly. The two versions are equivalent — the iterative version simply makes the implicit call stack explicit.
- **LAB-029 (Trees and BSTs):** Tree traversal (visiting every node in a tree) is recursive in structure. The algorithms you write there will look exactly like `flatten` — a recursive function on a recursively-defined data structure.
- **LAB-031 (Sorting Algorithms):** Merge sort uses divide-and-conquer recursion: split the array, sort each half recursively, merge the results. Same two-part structure as `factorial`: base case (array of 0 or 1 is already sorted), recursive case (sort halves and combine).
- **LAB-033 (Dynamic Programming):** `fibSlow` vs `fibFast` is the canonical example. DP replaces exponential recursion with linear-time solutions by eliminating repeated subproblems through memoization or tabulation.
- **The PyX compiler (the project this curriculum builds toward):** The parser, the transformer, and the code generator are all recursive. `parse_element` calls `parse_children` which calls `parse_element` — this is a recursive function on a recursively-structured grammar. Every time you see a recursive data structure, you will write a recursive function.

**The real-world connection:**

Recursion is not an academic technique. JSON parsing, HTML parsing, directory listing, type-checking in compilers, rendering tree-structured UI, evaluating arithmetic expressions — all are inherently recursive because the data they process is recursively structured. Every language runtime's call stack is the mechanism that makes all of this possible.

---

## What Breaks Without This

**Concrete failure:** Try to flatten `[1, [2, [3, [4, [5]]]]]` iteratively without using an explicit stack.

```js
// Attempt without recursion and without an explicit stack:
function flattenBad(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      // We need to flatten item... but we can't call ourselves...
      // We could loop through item, but then what if item contains arrays?
      for (const subItem of item) {
        result.push(subItem);   // this only handles ONE level of nesting
      }
    } else {
      result.push(item);
    }
  }
  return result;
}

console.log(flattenBad([1, [2, [3]]]));
// → [1, 2, [3]]  — NOT flattened — the inner [3] was not processed
```

The iterative version without recursion only handles one level of nesting. To handle arbitrary depth, you need either recursion (which uses the call stack as the implicit history of where you are in the nesting) or an explicit stack data structure (which you manage yourself). There is no shortcut. The problem's recursive structure requires a recursive solution.

---

## Definition of Done

Verify each item before moving to LAB-009.

- [ ] `factorial(5)` returns `120` and you can trace the 6-frame call stack by hand
- [ ] `factorial(0)` returns `1` (the base case) without recursing
- [ ] `factorial(-1)` throws an error (you added the guard in the SAVE AND TRY)
- [ ] `fibonacci(10)` returns `55`
- [ ] You can explain why `fibonacci(50)` would be extremely slow with the naive version
- [ ] `fibFast(50)` returns `12586269025` instantly
- [ ] `flatten([1, [2, [3, [4]]]])` returns `[1, 2, 3, 4]`
- [ ] `flatten([[[[42]]]])` returns `[42]`
- [ ] You can name the base case and recursive case in each of the three functions above
- [ ] You can explain, in one sentence, why the call stack grows during recursion and shrinks during the return phase

**Git commit:**

```
git add .
git commit -m "LAB-008: implement factorial, fibonacci, and flatten to understand base-case/recursive-case structure and call-stack mechanics"
```

The message starts with the lab number (for navigation), names the three concrete things built, and states what was learned (not just what was added). Future-you reading this in six months will know exactly what this commit represents.

---

## Quick Check Answers

**1. If `f()` calls `f()` infinitely, what happens to the call stack? What error?**

Each call to `f()` pushes a new stack frame. Stack frames are never popped because `f()` never returns — it always calls itself again before returning. The stack grows continuously until it exhausts its allocated memory. The engine throws `Uncaught RangeError: Maximum call stack size exceeded`. The specific error name and message vary by engine and browser, but the cause is the same: the call stack has a fixed size and was filled completely.

**2. For the list-sum definition, which element is the "smaller problem"? What is the smallest list?**

The "smaller problem" is the tail of the list — everything except the first element. `sum([3, 1, 4, 1, 5])` = `3` + `sum([1, 4, 1, 5])`. The smaller problem has one fewer element. The smallest possible list is the empty list `[]`, where the sum is `0` by definition (the identity element for addition — adding zero items gives zero). This is the base case: `sum([]) = 0`.

**3. What is `factorial(0)`?**

`factorial(0) = 1`. This is defined by convention, not derived: it is the empty product (multiplying zero numbers together). The mathematical identity for multiplication is 1 — just as the empty sum is 0. Practically, this base case is what stops the recursion: `factorial(1) = 1 × factorial(0) = 1 × 1 = 1`. Without `factorial(0) = 1`, the recursion has no stopping point.

---

*Next: LAB-009 — Error Handling and Exceptions*
