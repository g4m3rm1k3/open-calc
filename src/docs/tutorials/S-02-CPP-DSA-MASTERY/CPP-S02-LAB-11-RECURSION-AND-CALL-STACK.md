# CPP DSA — LAB-11 — Recursion and the Call Stack

**Prerequisites:** LAB-10 (Queues and Circular Buffers)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What is a "base case," and what specifically goes wrong in a recursive function that doesn't have one?
2. When function `A` calls function `B`, where does `A`'s local variables and "return to this exact point" address get stored while `B` runs?
3. What is a stack overflow, concretely — which stack, and what happens when it's exceeded?

## What You Will Build

Factorial and Fibonacci implemented recursively, with a hand-built call-stack visualizer (reusing LAB-09's `MyStack<T>`) that prints every function call as it happens and every return as it unwinds — turning the normally-invisible call stack into something you watch happen, line by line.

```
$ ./recursion_demo
factorial(4) called
  factorial(3) called
    factorial(2) called
      factorial(1) called
        factorial(0) called
        factorial(0) returns 1
      factorial(1) returns 1
    factorial(2) returns 2
  factorial(3) returns 6
factorial(4) returns 24

Call stack depth trace for factorial(4): [4, 3, 2, 1, 0] at deepest point
```

## Concept: The Call Stack — Recursion Is LAB-09's Stack, Automated

**What it is:** Every function call in C++ — recursive or not — pushes a **stack frame** onto the program's **call stack**: the function's local variables, its parameters, and the address to return to once it finishes. When a function returns, its frame is popped, and execution resumes exactly where the caller left off. **Recursion** is simply a function calling itself — and every recursive call pushes a brand-new stack frame, with its own completely separate copy of the function's local variables and parameters, exactly the same as any other function call.

**The problem before:** Some problems are naturally defined in terms of smaller versions of themselves: `factorial(4)` is `4 * factorial(3)`, and `factorial(3)` is `3 * factorial(2)`, and so on — this recursive structure mirrors how factorial is actually *defined* mathematically far more directly than an iterative loop would. But without a **base case** — a condition that stops the recursion instead of calling itself again — a recursive function calls itself forever (or, more precisely, until the call stack physically runs out of space), each call pushing another frame that's never popped, because nothing ever returns.

**The solution:** Every recursive function needs exactly two parts: a base case (the smallest version of the problem, answered directly, with no further recursive call) and a recursive case (a smaller version of the problem, solved by calling the same function again, then combining that smaller result into the current answer). `factorial(0)` returning `1` directly, with no further call, is the base case that eventually stops every chain of `factorial(n)` calls from recursing forever.

**Canonical example:**

```cpp
long long factorial(int n) {
    if (n == 0) return 1;          // base case -- stops the recursion
    return n * factorial(n - 1);   // recursive case -- smaller problem, combined with n
}
```

**Project Application:** LAB-12's binary tree traversals and LAB-13's BST insert/search are both naturally recursive — a tree is defined recursively (a node with two smaller trees as children), so operations on it read most clearly as recursive functions. LAB-17's depth-first graph traversal is directly implementable either recursively (using the *real* call stack, implicitly) or iteratively with an explicit `MyStack` (LAB-09) — this lab is what makes that equivalence visible.

**Watch for:** Writing a recursive function with no base case, or a base case that's never actually reached (e.g., counting *down* toward zero from a starting value that's already negative). Both produce infinite recursion — each call pushes another stack frame, and because the call stack has a fixed, finite size (typically a few megabytes), this eventually exhausts it entirely: a **stack overflow**, which crashes the program, usually with no more specific error message than a plain segmentation fault.

## Step 1: `factorial`, and reproducing a stack overflow on purpose

```cpp
long long factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);
}
```

```cpp
// deliberately missing the base case -- DO NOT run this without expecting a crash
long long brokenFactorial(int n) {
    return n * brokenFactorial(n - 1); // NEVER stops -- n keeps decreasing past 0, into negative numbers, forever
}
```

`brokenFactorial` has no base case at all — `n` counts down past `0` into `-1`, `-2`, `-3`, ... forever, since nothing ever stops the recursion. Every call pushes a new stack frame; none of them ever return, since `return n * brokenFactorial(n - 1);` always needs the *next* call to finish first before it can compute its own return value — the frames pile up, unbounded, until the call stack's fixed memory budget is exhausted.

### SAVE AND TRY

Compile and run `brokenFactorial(5)` inside a `main()` that prints its result (expect a crash — that's the point, don't be alarmed). On most systems this crashes with a stack overflow / segmentation fault after a large but finite number of calls (often tens of thousands, depending on stack size and frame size) — a very fast, very real demonstration of exactly what "the call stack has a fixed size" means in practice, not just in theory.

## Step 2: Visualizing the call stack — instrumenting `factorial` to show its own recursion

```cpp
#include <iostream>
#include <string>

int depth = 0; // tracks current recursion depth, purely for indentation in the printout

long long factorialTraced(int n) {
    std::string indent(depth * 2, ' ');
    std::cout << indent << "factorial(" << n << ") called\n";
    depth++;

    long long result;
    if (n == 0) {
        result = 1;
    } else {
        result = n * factorialTraced(n - 1);
    }

    depth--;
    std::cout << indent << "factorial(" << n << ") returns " << result << "\n";
    return result;
}
```

Notice the structure: everything *before* the recursive call (`factorial(n) called`, `depth++`) happens on the way **down** into deeper recursion; everything *after* the recursive call returns (`depth--`, `factorial(n) returns ...`) happens on the way **back up**. This before/after split is exactly what a real call stack does, just made visible: `factorialTraced(4)` doesn't finish printing its own "returns" line until `factorialTraced(3)` — the call it made — has *completely* finished, including all of *its* own nested calls first.

### SAVE AND TRY

Run `factorialTraced(4)` and compare the output against "What You Will Build" at the top of this lab. Confirm the indentation visually nests deeper with each call and un-nests on the way back — this indentation pattern is a direct, visual stand-in for the actual call stack's depth at each moment, which is normally completely invisible while a program runs.

## Step 3: An explicit `MyStack` doing the same job iteratively

```cpp
#include "MyStack.h" // LAB-09

long long factorialIterative(int n) {
    MyStack<int> callStack;

    // "push" every call that WOULD have happened recursively
    int current = n;
    while (current > 0) {
        callStack.push(current);
        current--;
    }

    // now "unwind" -- exactly what returning from recursion does
    long long result = 1;
    while (!callStack.isEmpty()) {
        int value = callStack.pop();
        result *= value;
        std::cout << "unwinding: multiplied by " << value << ", running result = " << result << "\n";
    }

    return result;
}
```

This is the concept section's core claim made completely concrete: recursion *is* an implicit stack, and here it's been made explicit, using LAB-09's own `MyStack<T>` to manually do exactly what the real call stack does automatically — push a frame for every "call" going down, then pop and process them coming back up, in exact LIFO order (the *last* number pushed, `1`, is the *first* one multiplied in — though for factorial the order doesn't change the answer, it matters enormously for LAB-17's DFS traversal, where visit order is the entire point).

### SAVE AND TRY

Run `factorialIterative(4)` and watch the "unwinding" lines print. Confirm the final `result` matches `factorialTraced(4)`'s answer (`24`) — same answer, reached via an explicit `MyStack` instead of the compiler's own implicit one, direct proof the two are really doing the same underlying thing.

## Step 4: Fibonacci — two recursive calls, and why it's dramatically slower than factorial

```cpp
long long fibonacci(int n) {
    if (n <= 1) return n; // base case: fib(0) = 0, fib(1) = 1
    return fibonacci(n - 1) + fibonacci(n - 2); // TWO recursive calls, not one
}
```

Unlike `factorial`'s single recursive call per invocation, `fibonacci` makes *two* — which means the total number of calls doesn't grow linearly with `n` the way factorial's does; it grows exponentially, because `fibonacci(n-1)` and `fibonacci(n-2)` each spawn their own two further calls, and so on. `fibonacci(5)` alone triggers 15 total calls; `fibonacci(30)` triggers over 2.6 million — almost all of them recomputing the *exact same* smaller Fibonacci values over and over, redundantly, because nothing remembers a result once it's been computed.

### SAVE AND TRY

Add a global `long long callCount = 0;` incremented at the top of `fibonacci`, then call `fibonacci(10)`, `fibonacci(20)`, and `fibonacci(30)`, printing `callCount` (reset between each) after each. Confirm the growth is dramatically faster than linear — this is a real, hands-on encounter with exponential time complexity, and it directly motivates LAB-14's hash table: caching each `fibonacci(n)` result the first time it's computed (a technique called memoization) would let each unique value be computed exactly once instead of millions of times.

## 🎯 Challenge

Write `sumDigits(int n)` recursively — summing the digits of a positive integer (`sumDigits(1234)` → `1+2+3+4` → `10`) using `n % 10` (the last digit) and `n / 10` (the number with its last digit removed) as the recursive step, with a correctly chosen base case.

<details>
<summary>Solution</summary>

```cpp
int sumDigits(int n) {
    if (n == 0) return 0; // base case: no digits left to add
    return (n % 10) + sumDigits(n / 10);
}
```

```cpp
std::cout << sumDigits(1234) << "\n"; // 10
```

`n % 10` peels off the last digit (`1234 % 10 == 4`); `n / 10` (integer division) produces the number with that digit removed (`1234 / 10 == 123`) — each recursive call works on a strictly smaller number, guaranteeing the recursion eventually reaches `n == 0` and stops, exactly the "smaller version of the same problem" shape every correct recursive function needs.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Recursion | Some special language magic | An ordinary function call, just calling itself — same stack-frame mechanics as any call |
| Missing base case | The function just runs a long time | Infinite recursion — crashes via stack overflow, usually quickly |
| Call order vs. return order | Same order | Reversed — LIFO, exactly like LAB-09's stack: last call in, first to return |
| `fibonacci`'s speed | Should be about as fast as `factorial` | Exponentially slower — two recursive calls per invocation compounds fast |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `factorialTraced`'s "returns" line only print AFTER its recursive call has fully finished? | |
| 2 | Why does `factorialIterative`'s explicit `MyStack` process values in the reverse order they were pushed? | |
| 3 | Why does `fibonacci(30)` make millions of calls when there are only 31 distinct Fibonacci values from 0 to 30? | |

## Quick Check Answers

1. A base case is the smallest version of the problem, answered directly with no further recursive call — without one, a recursive function keeps calling itself on an ever-changing (or unchanging) input with nothing ever satisfying a stopping condition, so every call pushes a new stack frame that never gets to return.
2. It's stored in a stack frame, pushed onto the program's call stack — `A`'s frame stays there, holding its local state and return address, for as long as `B` (and anything `B` calls) is still running, and is only popped once `B` fully returns control back to `A`.
3. It's a stack overflow — the call stack (a fixed-size region of memory reserved for tracking active function calls) has run out of room for more stack frames, because recursion never stopped adding new ones; the program crashes, typically reported as a segmentation fault with no more specific diagnostic.

*Next: [LAB-12 — Binary Trees](CPP-S02-LAB-12-BINARY-TREES.md)*
