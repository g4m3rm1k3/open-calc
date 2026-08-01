# SE Masterclass — LAB-07 — Recursion

**Language: C++** *(final lab in C++ before returning to JavaScript for LAB-08)*
*Why C++ still:* LAB-06 already used recursion to walk trees and graphs, but never looked directly AT the call stack. C++ makes stack overflow a real, reproducible crash instead of a vague error message — seeing it happen makes "the call stack has a limit" concrete.

**Prerequisites:** LAB-06 (Trees and Graphs — C++). You already wrote five recursive functions there without a name for the pattern itself. This lab names it and studies it directly.

**What this lab adds:**
- The two-part contract every recursive function must have: base case + recursive case
- Visualizing the call stack as it grows and shrinks
- Multiple recursive calls per function (branching recursion) and why it explodes
- Tail recursion — the one shape of recursion that *could* avoid growing the stack
- Converting a recursive function to an iterative one, and why you'd want to
- Causing (and understanding) a real stack overflow

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Every recursive function needs a "base case." What breaks if you write a recursive function WITHOUT one?
> 2. If `f(5)` calls `f(4)` which calls `f(3)` which calls `f(2)`... which call finishes FIRST — `f(2)` or `f(5)`?
> 3. `fib(n)` calling both `fib(n-1)` AND `fib(n-2)` is a different shape of recursion than `factorial(n)` calling only `factorial(n-1)`. What's the practical difference in how much work each does?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, compiling and running `main.cpp` prints:

```
=== Factorial ===
factorial(5) = 120

=== Call Stack Trace ===
-> factorial(4) called
  -> factorial(3) called
    -> factorial(2) called
      -> factorial(1) called
        -> factorial(0) called
        <- factorial(0) returns 1
      <- factorial(1) returns 1
    <- factorial(2) returns 2
  <- factorial(3) returns 6
<- factorial(4) returns 24

=== Branching Recursion: Tower of Hanoi ===
move disk 1 from A to C
move disk 2 from A to B
move disk 1 from C to B
move disk 3 from A to C
move disk 1 from B to A
move disk 2 from B to C
move disk 1 from A to C
total moves: 7

=== Tail Recursion: GCD ===
gcd(48, 18) = 6
gcd(1071, 462) = 21

=== Recursive vs Iterative: sum 1 to 100000 ===
recursive result: 5000050000
iterative result: 5000050000

=== Stack Overflow Demo ===
About to trigger a stack overflow with unbounded recursion.
Compile with the depth check DISABLED to see it crash.
Depth check ENABLED — stopped safely at depth 100000
```

---

### Concept: The Base Case / Recursive Case Contract

**What it is:** Every correct recursive function has exactly two parts: a **base case** (a condition simple enough to answer directly, with no further recursion) and a **recursive case** (a step that makes the problem SMALLER and calls itself again).

**The problem before:** Without a base case, a recursive function calls itself forever — there is no signal to stop. Each call needs its own space to store its local variables and return address (a **stack frame**). Infinite recursion means infinite stack frames, which is a **stack overflow** — the program crashes.

**The solution:** Confirm two things are true before trusting any recursive function:
1. There is at least one base case that returns WITHOUT recursing.
2. Every recursive call moves STRICTLY closer to a base case (the input must shrink — not stay the same, not grow).

**Canonical example (General Explanation):**

Think of Russian nesting dolls (matryoshka). Opening a doll either reveals a smaller doll (recursive case: "open this one too") or reveals nothing more — solid wood (base case: "stop, there's nothing further to open"). If a doll somehow contained an IDENTICAL doll of the SAME size, you would open forever. The dolls must get strictly smaller for the process to end.

```cpp
int factorial(int n) {
    if (n == 0) return 1;              // base case: 0! = 1, by definition, no recursion needed
    return n * factorial(n - 1);       // recursive case: n! = n * (n-1)!, and n-1 is strictly smaller
}
```

**Project Application (The "Why" here):**

`insert`, `preorder`, `inorder`, `postorder`, and `dfs` in LAB-06 all had this same shape: `if (node == nullptr) return;` was the base case in every single one. You were already writing this contract five times without naming it.

**Watch for:** "The input must shrink" is not automatically true just because you subtracted something. `factorial(n)` calling `factorial(n - 1)` shrinks correctly. A bug like `factorial(n)` calling `factorial(n)` (forgetting the `- 1`) never shrinks, and never terminates until the stack overflows.

---

## Step 1 — Factorial: The Minimal Recursive Function

```cpp
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int factorial(int n) {
    if (n == 0) return 1;              // ← add: base case
    return n * factorial(n - 1);       // ← add: recursive case — n shrinks toward 0 every call
}

int main() {
    cout << "=== Factorial ===" << endl;
    cout << "factorial(5) = " << factorial(5) << endl;

    return 0;
}
```

### SAVE AND TRY

```bash
g++ main.cpp -o main
./main
```

**Expected:**
```
=== Factorial ===
factorial(5) = 120
```

**Trace it by hand:** `factorial(5)` needs `factorial(4)`'s answer before it can multiply by 5. `factorial(4)` needs `factorial(3)`'s answer first. This chains down to `factorial(0)`, which answers immediately (`1`) without waiting on anything. Then the multiplications happen on the way back UP: `factorial(1) = 1 * 1 = 1`, `factorial(2) = 2 * 1 = 2`, `factorial(3) = 3 * 2 = 6`, `factorial(4) = 4 * 6 = 24`, `factorial(5) = 5 * 24 = 120`.

**Change something:** Call `factorial(0)` directly. It should return `1` immediately — no recursion happens at all, since `n == 0` is true on the very first call.

---

### Concept: The Call Stack, Visualized

**What it is:** Every function call — recursive or not — pushes a new **stack frame** onto the call stack: a block of memory holding that call's parameters, local variables, and the address to return to when it finishes. Recursion makes this normally-invisible mechanism visible, because a function is stacking frames of ITSELF.

**The problem before:** `factorial(5)`'s single line `return n * factorial(n - 1);` hides an enormous amount of bookkeeping. Without understanding the stack, it looks like magic that the right multiplication happens at the right time.

**The solution:** Instrument the function with print statements that show entry and exit, indented by depth. This turns the invisible stack into visible text.

**Canonical example (General Explanation):**

Think of a stack of dinner plates (this is the exact same stack structure from LAB-05's `std::stack`). Calling `factorial(4)` places a plate on the stack, which calls `factorial(3)` and places another plate ON TOP, and so on down to `factorial(0)`. Each plate can only be removed (the function can only return) once every plate stacked ON TOP of it is gone. This is why the innermost call (`factorial(0)`) finishes FIRST, and the outermost call (`factorial(5)`) finishes LAST — LIFO, exactly like `std::stack` from LAB-05.

```
Stack grows (calls):        Stack shrinks (returns):
factorial(5)                 <- returns 120
  factorial(4)                 <- returns 24
    factorial(3)                 <- returns 6
      factorial(2)                 <- returns 2
        factorial(1)                 <- returns 1
          factorial(0)                 <- returns 1  (base case, bottom of the recursion)
```

**Project Application (The "Why" here):**

This diagram is literally what the `-> factorial(4) called` / `<- factorial(4) returns 24` trace in this lab's output will look like — indentation depth IS stack depth.

**Watch for:** The deepest call (`factorial(0)`) is the FIRST to return, not the last. This trips people up because we usually read code top-to-bottom and expect "first written" to mean "first finished" — recursion inverts that.

---

## Step 2 — Instrument the Call Stack

```cpp
int factorialTraced(int n, int depth) {          // ← add: 'depth' tracks how deep we are, for indentation
    string indent(depth * 2, ' ');                // ← add: 2 spaces per depth level

    if (n == 0) {
        cout << indent << "-> factorial(0) called" << endl;
        cout << indent << "<- factorial(0) returns 1" << endl;
        return 1;
    }

    cout << indent << "-> factorial(" << n << ") called" << endl;   // ← add: print BEFORE recursing
    int result = n * factorialTraced(n - 1, depth + 1);              // ← add: depth + 1 for the deeper call
    cout << indent << "<- factorial(" << n << ") returns " << result << endl;   // ← add: print AFTER returning
    return result;
}
```

Add to `main()`:

```cpp
cout << endl << "=== Call Stack Trace ===" << endl;
factorialTraced(4, 0);   // ← add: start at depth 0
```

### SAVE AND TRY

```bash
g++ main.cpp -o main
./main
```

**Expected:**
```
=== Call Stack Trace ===
-> factorial(4) called
  -> factorial(3) called
    -> factorial(2) called
      -> factorial(1) called
        -> factorial(0) called
        <- factorial(0) returns 1
      <- factorial(1) returns 1
    <- factorial(2) returns 2
  <- factorial(3) returns 6
<- factorial(4) returns 24
```

**Read the shape:** The indentation forms a V — growing deeper with each `->` line (a call), then shrinking back with each `<-` line (a return), perfectly mirroring the stack diagram from the Concept section above. `factorial(0)` sits at the bottom point of the V — deepest call, and the first to complete.

**Change something:** Call `factorialTraced(6, 0)` instead. Count the `->` lines — there should be 7 (for `n = 6, 5, 4, 3, 2, 1, 0`). Change it back to `4`.

---

### Concept: Branching Recursion

**What it is:** `factorial` makes exactly ONE recursive call per invocation — a straight line down the stack. Some problems naturally split into MULTIPLE recursive calls per invocation, forming a branching tree of calls instead of a straight line.

**The problem before:** The Tower of Hanoi puzzle — move a stack of disks from one peg to another, never placing a larger disk on a smaller one, using a spare peg — seems to require tracking enormous amounts of state: which disks are where, which moves are legal from here.

**The solution:** Notice the recursive structure: to move `n` disks from `A` to `C` (using `B` as spare), you actually only need to solve two SMALLER versions of the exact same problem, plus one direct move:
1. Move the top `n-1` disks from `A` to `B` (using `C` as spare) — a smaller Tower of Hanoi
2. Move the single remaining largest disk from `A` to `C` directly — the "do something" step
3. Move the `n-1` disks from `B` to `C` (using `A` as spare) — another smaller Tower of Hanoi

**Canonical example (General Explanation):**

This is exactly how LAB-06's `preorder(node)` worked: `preorder(node->left)` and `preorder(node->right)` are TWO recursive calls per invocation, not one — Tower of Hanoi has the identical branching shape, just with three named steps instead of two.

```cpp
void hanoi(int n, char from, char to, char spare) {
    if (n == 0) return;                    // base case: no disks to move
    hanoi(n - 1, from, spare, to);          // step 1: move n-1 disks out of the way
    cout << "move disk " << n << " from " << from << " to " << to << endl;  // step 2: move the big one
    hanoi(n - 1, spare, to, from);          // step 3: move the n-1 disks onto the big one
}
```

**What it hides (Law 7):** You never have to think about disk 3's exact position during the recursive calls for disk 1 and disk 2 — each recursive call only needs to reason about ITS OWN subset of disks and pegs, trusting that the recursive calls below it are correct. This is the core promise of recursion: trust the recursive call to solve the smaller problem correctly, and focus only on how to combine its result.

**Where you will see this:** Branching recursion is the shape behind merge sort (split in half, recurse on both halves, merge), quicksort, and — as you already saw in LAB-02 — naive (non-memoized) Fibonacci, where the branching causes MASSIVE duplicated work (which memoization fixed).

---

## Step 3 — Tower of Hanoi

```cpp
int hanoiMoveCount = 0;    // ← add: track total moves across the whole recursive call tree

void hanoi(int n, char from, char to, char spare) {
    if (n == 0) return;                             // ← add: base case — zero disks, nothing to do

    hanoi(n - 1, from, spare, to);                   // ← add: move n-1 disks out of the way, onto spare
    cout << "move disk " << n << " from " << from << " to " << to << endl;   // ← add: move the big disk
    hanoiMoveCount++;                                // ← add
    hanoi(n - 1, spare, to, from);                   // ← add: move the n-1 disks from spare onto target
}
```

Add to `main()`:

```cpp
cout << endl << "=== Branching Recursion: Tower of Hanoi ===" << endl;
hanoi(3, 'A', 'C', 'B');    // ← add: move 3 disks from A to C, using B as spare
cout << "total moves: " << hanoiMoveCount << endl;   // ← add
```

### SAVE AND TRY

**Expected:**
```
=== Branching Recursion: Tower of Hanoi ===
move disk 1 from A to C
move disk 2 from A to B
move disk 1 from C to B
move disk 3 from A to C
move disk 1 from B to A
move disk 2 from B to C
move disk 1 from A to C
total moves: 7
```

**The formula:** Solving `n` disks always takes exactly `2^n - 1` moves. For `n = 3`: `2^3 - 1 = 7` ✓. This formula falls directly out of the recursive structure: `moves(n) = moves(n-1) + 1 + moves(n-1) = 2*moves(n-1) + 1`.

**Change something:** Change `hanoi(3, ...)` to `hanoi(10, ...)`. Predict the move count first using the formula (`2^10 - 1 = 1023`), then run and confirm `total moves: 1023`. Change it back to `3`.

---

## 🎯 Challenge: Count Recursive Calls, Not Just Moves

**You know:** Branching recursion calls itself multiple times per invocation, which can cause the total call count to grow much faster than the problem size.

**Task:** Add a global counter `hanoiCallCount` that increments once at the TOP of `hanoi`, every single time it's called (including calls that immediately hit the base case and return). For `n = 3`, how many total calls happen — not moves, CALLS? Predict before running, then verify.

**Hint:** The base case call (`n == 0`) still counts as a call — it just doesn't recurse further or print a move.

<details>
<summary>▶ Show Solution</summary>

```cpp
int hanoiCallCount = 0;

void hanoi(int n, char from, char to, char spare) {
    hanoiCallCount++;                 // count EVERY call, including base-case calls that do nothing else
    if (n == 0) return;
    hanoi(n - 1, from, spare, to);
    cout << "move disk " << n << " from " << from << " to " << to << endl;
    hanoiMoveCount++;
    hanoi(n - 1, spare, to, from);
}
```

For `n = 3`: `15` total calls. **Key insight:** The call count follows `2^(n+1) - 1` (a complete binary tree of depth `n`), while the MOVE count follows `2^n - 1` — moves only happen at non-base-case calls, and there's always exactly one fewer "does nothing" base-case call type than total working calls at each level. The gap between "calls" and "useful work done" is exactly what makes naive branching recursion expensive — half of all calls (roughly) do nothing but immediately return.

</details>

---

### Concept: Tail Recursion

**What it is:** A recursive call is in **tail position** when it is the VERY LAST thing the function does — nothing happens after it returns. `factorial`'s `return n * factorial(n - 1);` is NOT tail-recursive — there's still a multiplication to do AFTER `factorial(n-1)` returns. A tail-recursive version does all the work BEFORE the recursive call, carrying the running result as a parameter.

**The problem before:** Every stack frame in `factorial(n)`'s chain must stay alive until the very end, because each one still has pending work (the multiplication) waiting on its child's return value. For very large `n`, this means very large stack usage — proportional to `n`.

**The solution:** Restructure so the recursive call is the LAST action, with the "running total" passed as an extra parameter instead of computed after the call returns.

**Canonical example (General Explanation):**

```cpp
// NOT tail-recursive: multiplication happens AFTER the recursive call returns
int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);    // work remains pending after this call
}

// Tail-recursive: the recursive call is the LAST thing that happens
int factorialTail(int n, int accumulator) {
    if (n == 0) return accumulator;               // no work pending after this returns
    return factorialTail(n - 1, n * accumulator);  // all the work is done BEFORE recursing
}
// call as: factorialTail(5, 1)
```

**What it hides (Law 7):** In languages/compilers that perform **tail call optimization (TCO)**, a tail-recursive call can REUSE the current stack frame instead of pushing a new one — turning the recursion into a loop under the hood, using constant stack space regardless of `n`. C++ compilers MAY do this with optimizations enabled (`-O2`), but it is not guaranteed by the language standard, unlike in some other languages (Scheme guarantees it).

**Watch for:** Do not assume C++ tail calls are always optimized — verify with a debugger or by testing with a large `n` if this matters for your program. This is why the classic Euclidean GCD algorithm below is a genuinely good habit even in C++: it's tail-recursive AND simple enough to trivially rewrite as a loop, which you'll do in Step 5.

---

## Step 4 — Tail-Recursive GCD

The **Euclidean algorithm** computes the greatest common divisor of two numbers using one of the oldest known algorithms, and it happens to be naturally tail-recursive.

```cpp
int gcd(int a, int b) {
    if (b == 0) return a;         // ← add: base case — nothing left to divide by
    return gcd(b, a % b);         // ← add: tail call — no work happens after this returns
}
```

Add to `main()`:

```cpp
cout << endl << "=== Tail Recursion: GCD ===" << endl;
cout << "gcd(48, 18) = " << gcd(48, 18) << endl;       // ← add
cout << "gcd(1071, 462) = " << gcd(1071, 462) << endl; // ← add
```

### SAVE AND TRY

**Expected:**
```
=== Tail Recursion: GCD ===
gcd(48, 18) = 6
gcd(1071, 462) = 21
```

**Trace it by hand:** `gcd(48, 18)` → `b` isn't 0, so call `gcd(18, 48 % 18)` = `gcd(18, 12)` → `gcd(12, 18 % 12)` = `gcd(12, 6)` → `gcd(6, 12 % 6)` = `gcd(6, 0)` → `b == 0`, return `6`. Each step replaces `(a, b)` with `(b, a mod b)` — this always terminates because `b` strictly decreases each time.

**Change something:** Call `gcd(17, 5)` — two numbers with no common factor besides 1. Confirm it returns `1`.

---

### Concept: Recursion vs Iteration — When to Convert

**What it is:** Any recursive function can be rewritten as an equivalent loop (iteration), and vice versa — they have equal computational power. The choice is about clarity and cost, not capability.

**The problem before:** Recursion is often clearer for problems that are naturally self-similar (trees, Tower of Hanoi, GCD) — but every recursive call has real overhead (a new stack frame) and a real limit (the stack can only grow so large before overflowing). A loop uses a single, fixed amount of stack space no matter how many iterations it runs.

**The solution:** When a recursive function is tail-recursive (like `gcd` and `factorialTail` above), converting it to a loop is mechanical: the parameter that was being threaded through becomes a variable that gets reassigned each iteration.

**Canonical example (General Explanation):**

```cpp
// Tail-recursive:
int factorialTail(int n, int acc) {
    if (n == 0) return acc;
    return factorialTail(n - 1, n * acc);
}

// The SAME logic as a loop — 'n' and 'acc' become reassignable variables:
int factorialLoop(int n) {
    int acc = 1;
    while (n != 0) {
        acc = n * acc;    // exactly the computation that was passed into the next call
        n = n - 1;        // exactly the shrinking step
    }
    return acc;
}
```

**Project Application (The "Why" here):**

For deep or performance-sensitive recursion, converting to a loop removes the stack-depth limit entirely and avoids per-call function overhead. You'll measure this difference directly in Step 5.

**Watch for:** NOT every recursive function converts this cleanly. Branching recursion (Tower of Hanoi, tree traversal) needs an explicit stack or queue data structure to convert to iteration — you're not eliminating the "stack" concept, just managing it yourself instead of relying on the call stack. LAB-06's DFS could be rewritten iteratively using `std::stack` from LAB-05 for exactly this reason.

---

## Step 5 — Convert to Iteration and Measure

```cpp
long long sumRecursive(int n) {
    if (n == 0) return 0;                       // ← add: base case
    return n + sumRecursive(n - 1);              // ← add: NOT tail-recursive — addition happens after
}

long long sumIterative(int n) {
    long long total = 0;                         // ← add
    for (int i = 1; i <= n; i++) {                // ← add: same shrinking/growing logic, as a loop
        total += i;
    }
    return total;
}
```

Add to `main()`:

```cpp
cout << endl << "=== Recursive vs Iterative: sum 1 to 100000 ===" << endl;
cout << "recursive result: " << sumRecursive(100000) << endl;   // ← add
cout << "iterative result: " << sumIterative(100000) << endl;   // ← add
```

### SAVE AND TRY

```bash
g++ main.cpp -o main
./main
```

**Expected:**
```
=== Recursive vs Iterative: sum 1 to 100000 ===
recursive result: 5000050000
iterative result: 5000050000
```

Both produce the identical mathematically correct answer (`n(n+1)/2` for `n = 100000`). But `sumRecursive(100000)` pushes 100,000 stack frames simultaneously before any addition happens — right at the edge of what a default C++ stack can hold. Try `sumRecursive(1000000)` (one million) and you will very likely see the program crash instead of printing a result — this is the stack overflow the next section studies directly.

**Change something:** Time both versions using `<chrono>` (see LAB-01's floating-point section for a similar measurement pattern in JS — here it's `#include <chrono>`, `auto start = chrono::high_resolution_clock::now();`). The iterative version should be measurably faster and use flat, constant memory regardless of `n`.

---

### Concept: Stack Overflow — Seeing the Limit

**What it is:** The call stack has a fixed maximum size (often around 1MB by default, meaning roughly 10,000–1,000,000 frames depending on frame size). Recursion that goes deeper than this limit crashes the program with a **stack overflow** — the operating system detects the stack has grown past its allotted memory and terminates the process.

**The problem before:** "The stack has a limit" sounds abstract until you actually hit it. Without seeing a real overflow, it's easy to write recursion that works fine in testing (small inputs) and crashes in production (larger inputs) — a bug class that's invisible until it isn't.

**The solution:** Deliberately trigger it, in a controlled way, to make the limit real. Then show the standard defense: an explicit depth check that fails gracefully instead of crashing.

**Canonical example (General Explanation):**

```cpp
int recurseForever(int depth) {
    return 1 + recurseForever(depth + 1);   // no base case — depth GROWS, never shrinks toward anything
}
```

Calling `recurseForever(0)` will eventually crash the entire program — not throw a catchable C++ exception, just terminate. This is different from every other kind of error in this curriculum so far: there is no `try`/`catch` that saves you from a stack overflow in C++.

**The defense — an explicit depth limit:**

```cpp
int recurseWithLimit(int depth, int maxDepth) {
    if (depth >= maxDepth) {
        cout << "Depth check ENABLED — stopped safely at depth " << depth << endl;
        return depth;
    }
    return recurseWithLimit(depth + 1, maxDepth);
}
```

**Where you will see this:** Any recursive function processing user-supplied or unbounded data (parsing deeply nested JSON, walking an unknown-depth file tree, evaluating deeply nested expressions in LAB-12) needs either a depth limit or a genuinely tail-recursive/iterative rewrite — otherwise malicious or just unusually deep input becomes a crash, which is a real, exploitable category of bug (a "stack exhaustion" denial-of-service).

---

## Step 6 — Depth-Limited Recursion

```cpp
int recurseWithLimit(int depth, int maxDepth) {
    if (depth >= maxDepth) {                        // ← add: the defense — an explicit, checked limit
        cout << "Depth check ENABLED — stopped safely at depth " << depth << endl;
        return depth;
    }
    return recurseWithLimit(depth + 1, maxDepth);    // ← add: grows toward maxDepth, never past it
}
```

Add to `main()`:

```cpp
cout << endl << "=== Stack Overflow Demo ===" << endl;
cout << "About to trigger a stack overflow with unbounded recursion." << endl;
cout << "Compile with the depth check DISABLED to see it crash." << endl;
recurseWithLimit(0, 100000);   // ← add: safe — has an explicit limit
```

### SAVE AND TRY

```bash
g++ main.cpp -o main
./main
```

**Expected:**
```
=== Stack Overflow Demo ===
About to trigger a stack overflow with unbounded recursion.
Compile with the depth check DISABLED to see it crash.
Depth check ENABLED — stopped safely at depth 100000
```

**Now see the actual crash (optional, and instructive):** Comment out the `recurseWithLimit` call and add this instead — with NO base case at all:

```cpp
int recurseForever(int depth) {
    if (depth % 10000 == 0) cout << "depth: " << depth << endl;   // print periodically so you see it climbing
    return 1 + recurseForever(depth + 1);   // no base case — this WILL crash
}
```

Call `recurseForever(0);`. Compile and run. The program prints increasing depth values, then terminates abruptly — often with a message like `Segmentation fault` or the program simply stops with no further output and a non-zero exit code. This is the stack overflow. There is no clean error message because the operating system killed the process from outside — the C++ runtime never got a chance to print anything.

**Restore `recurseWithLimit(0, 100000);` afterward** — the file should end in the safe, working state.

---

## Final Check

| Feature | How to verify |
|---|---|
| `factorial(5)` returns `120` | Step 1 output |
| Traced factorial shows a V-shaped indentation pattern | `->` lines deepen, `<-` lines shrink back, in Step 2's output |
| Tower of Hanoi for 3 disks makes exactly 7 moves | `2^3 - 1 = 7`, confirmed in Step 3 |
| `gcd(48, 18)` returns `6`, `gcd(1071, 462)` returns `21` | Step 4 output |
| Recursive and iterative sum agree exactly | Both print `5000050000` in Step 5 |
| You witnessed (or can explain) an actual stack overflow | Optional crash demo in Step 6 |
| You can explain "base case" and "recursive case" out loud, without notes | Every recursive function in this lab needed both |
| You can explain why `factorial` is NOT tail-recursive but `gcd` IS | Multiplication happens after the call in one; nothing happens after the call in the other |

---

## Quick Check Answers

**1. What breaks without a base case?**

The function calls itself forever (or until the input somehow stops shrinking on its own, which usually doesn't happen). Each call pushes a new stack frame. Eventually the call stack runs out of memory and the program crashes with a stack overflow — demonstrated directly in Step 6's `recurseForever` example, which has no base case and eventually terminates the whole program, not just that function call.

**2. In `f(5)` calling `f(4)` calling `f(3)` calling `f(2)`, which finishes first?**

`f(2)` finishes first. The call stack is LIFO (last in, first out) — exactly like `std::stack` from LAB-05. `f(2)` was the LAST call pushed onto the stack, so it's the first one able to return, since nothing is stacked on top of it anymore. `f(5)` was the first call made, so it must wait for everything stacked above it (`f(4)`, `f(3)`, `f(2)`) to finish first — it finishes LAST. This was directly visible in Step 2's traced output: the innermost `-> factorial(0) called` / `<- factorial(0) returns 1` pair appeared at the bottom of the V and completed before any of the calls above it.

**3. What's the practical difference between `factorial`'s single recursive call and `fib`'s two recursive calls?**

`factorial(n)` makes exactly ONE recursive call per invocation — the total number of calls grows LINEARLY with `n` (roughly `n` calls total). A function like naive Fibonacci that makes TWO recursive calls per invocation (`fib(n-1)` AND `fib(n-2)`) creates a branching tree of calls whose total size grows EXPONENTIALLY with `n` — this lab's Tower of Hanoi challenge showed this directly: `n = 3` disks required 15 total calls, and the call count formula (`2^(n+1) - 1`) grows explosively for larger `n`. This exact cost problem is why LAB-02's memoized Fibonacci mattered — caching collapses the exponential call tree back down to linear work by never repeating an already-answered subproblem.

---

*Next: [LAB-08 — Complexity](LAB-08-complexity.md) — JavaScript*
