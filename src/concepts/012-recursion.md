---
concept: 012-recursion
name: Recursion
---

## Definition

Recursion is a function that calls itself, working toward a **base case** — a
condition simple enough to answer directly, without another call.

## Problem

Some problems are naturally defined in terms of smaller versions of themselves —
a directory containing files and other directories, a tree of nested comments.
Recursion lets the solution mirror that self-similar structure directly, instead
of manually managing a stack or queue to simulate it.

## Execution

Call factorial(3)
↓
3 == 0? No → return 3 * factorial(2)
↓
Call factorial(2) — new stack frame pushed
↓
2 == 0? No → return 2 * factorial(1)
↓
Call factorial(1) — new stack frame pushed
↓
1 == 0? No → return 1 * factorial(0)
↓
Call factorial(0) — new stack frame pushed
↓
0 == 0? Yes → return 1 (base case — no further calls)
↓
factorial(1) resumes: 1 * 1 = 1 → returns 1, its frame pops
↓
factorial(2) resumes: 2 * 1 = 2 → returns 2, its frame pops
↓
factorial(3) resumes: 3 * 2 = 6 → returns 6, its frame pops

## Computer Science

Every recursive call pushes a new stack frame, exactly like any other function
call (see the Function concept) — recursion has no special call mechanism, it's
just a function whose body happens to call itself. Without a base case that stops
the recursion, calls keep pushing frames until the call stack runs out of memory —
a **stack overflow**.

Tags: Call stack, Base case, Stack overflow, Divide and conquer

## Software Engineering

Recursion often expresses a self-similar problem more directly than an equivalent
loop would, at the cost of stack space proportional to the recursion depth — a
loop-based version typically uses constant memory instead. For very deep
recursion (processing millions of nested items), that memory cost is a real,
practical reason to prefer an iterative rewrite.

Tags: Readability vs. memory cost, Stack depth, Iterative alternatives

## Common Mistakes

- Forgetting the base case entirely, or writing a base case the recursive calls never actually reach, causing infinite recursion and a stack overflow.
- Using recursion for a problem with very deep nesting (processing a huge list one recursive call per item) where an iterative loop would use far less memory.

## Exercises

- Trace `factorial(4)` by hand the same way the Execution section traces `factorial(3)`, before running it.
- Remove the base case from any of the three examples and predict what error occurs, then run it to confirm.

## javascript

```javascript
function factorial(n) {
  if (n === 0) return 1        // base case
  return n * factorial(n - 1)  // recursive case
}

console.log(factorial(3))   // 6
```
Walkthrough: `factorial(3)` doesn't return directly — it calls `factorial(2)`,
which calls `factorial(1)`, which calls `factorial(0)`, which finally hits the base
case and returns `1` without any further calls. Each waiting call then resumes and
multiplies, unwinding back up: `1*1=1`, `2*1=2`, `3*2=6` — matching the Execution
trace above exactly.

## python

```python
def factorial(n):
    if n == 0:
        return 1        # base case
    return n * factorial(n - 1)   # recursive case

print(factorial(3))   # 6
```
Walkthrough: identical logic and identical unwinding to the JavaScript version.
One real Python-specific limit worth knowing: CPython caps recursion depth at
1000 calls by default (`RecursionError` beyond that) — a much lower ceiling than
JavaScript or Java's call stacks typically allow before overflowing.

## java

```java
static int factorial(int n) {
    if (n == 0) return 1;        // base case
    return n * factorial(n - 1); // recursive case
}

System.out.println(factorial(3));   // 6
```
Walkthrough: same recursive structure and unwinding as the other two. Java has no
built-in recursion depth limit the way Python does — it recurses until the JVM's
actual stack memory (configurable, but finite) is exhausted, producing a
`StackOverflowError`.
