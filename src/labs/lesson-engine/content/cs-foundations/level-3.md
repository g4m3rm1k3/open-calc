---
series: cs-foundations
level: 3
title: How Functions Really Work
lang: javascript
---

# How Functions Really Work

You have been calling functions since the first lesson in any language series. But calling a function is not a simple jump to another line of code — it is a sequence of machine-level operations involving memory, registers, and a precise calling convention that every programming language follows. Understanding what actually happens when a function is called — and what happens when one function calls another in a chain — is what makes call stacks, recursion limits, closures, and tail-call optimisation make sense rather than seem arbitrary.

This lesson is about the mechanism behind function calls, not their syntax. By the end of it you will understand the call stack as a physical structure in memory, why stack overflow is a memory error, what makes a recursive function expensive, and what closures capture and where they store it.

## What happens when a function is called

Before this lesson: you know that calling `greet('Alice')` executes the body of `greet` and returns a value. After this lesson: you know the six-step machine sequence that makes that happen.

```text
Calling a function: the six steps

  1. PUSH ARGUMENTS:    The caller places the argument values in registers or on the stack
                        where the called function knows to find them.

  2. PUSH RETURN ADDRESS: The caller pushes the address of the instruction AFTER the call —
                        where execution should resume when the function is done.

  3. JUMP:              The program counter is set to the first instruction of the called function.

  4. ALLOCATE FRAME:    The called function allocates space on the stack for its local variables.
                        (Technically: the stack pointer is decremented by the frame size.)

  5. EXECUTE:           The function runs its instructions using registers and its local stack frame.

  6. RETURN:            The function places its return value in a register the caller knows,
                        restores the stack pointer, and jumps to the return address.
                        The caller's frame is now the top of the stack again.

The stack at step 4 contains:
  ┌──────────────────────────┐ ← stack pointer (top of stack)
  │ callee frame:            │
  │   local variables        │
  │   return address         │
  ├──────────────────────────┤
  │ caller frame:            │
  │   local variables        │
  └──────────────────────────┘
```

```javascript
function add(a, b) {
  const result = a + b   // result lives in the add() frame
  return result
}

function main() {
  const x = 3             // x lives in the main() frame
  const y = add(x, 4)    // add's frame is pushed; when add returns, it is popped; y = 7
  return y
}
```

```text
Call sequence for main() → add(3, 4):

  main() frame pushed — x = 3
  add(3, 4) called:
    add() frame pushed — a = 3, b = 4, result = 7
    add() returns 7
    add() frame popped
  y = 7 (stored in main() frame)
  main() returns 7
  main() frame popped
```

**CS lens:** The machine calling convention — exactly which registers hold arguments, which register holds the return value, and which registers a callee must preserve — is the **Application Binary Interface (ABI)**. It is a contract between the compiler and the CPU that makes it possible for code compiled by different compilers, in different languages, to call each other. When JavaScript calls a native C function (via Node's native addons) or a WebAssembly function, both sides follow the same ABI. The ABI is what makes "calling a function" mean something consistent across the entire ecosystem.

## The call stack grows with every call

Each function call pushes a new frame. Nested calls produce nested frames. Deeply nested calls produce a deeply stacked set of frames.

```javascript
function a() { return b() }
function b() { return c() }
function c() { return 42  }
a()
```

```text
Call stack when c() is executing:

  ┌─────────────┐ ← stack pointer
  │ c() frame   │ — currently executing
  ├─────────────┤
  │ b() frame   │ — waiting for c() to return
  ├─────────────┤
  │ a() frame   │ — waiting for b() to return
  ├─────────────┤
  │ main frame  │ — waiting for a() to return
  └─────────────┘

When c() returns:
  c() frame popped → b() resumes, returns c()'s result
  b() frame popped → a() resumes, returns b()'s result
  a() frame popped → main resumes, has the value 42

The stack always represents the CURRENT CHAIN OF CALLS in progress.
"The call stack" in error messages IS this stack — the list of frames
that are currently on the stack at the moment an error occurred.
```

```javascript
// Stack overflow: adding frames faster than they are removed

function countDown(n) {
  return countDown(n - 1)   // calls itself — another frame pushed
  // The original frame is never popped because countDown never returns
}

countDown(100000)
// → RangeError: Maximum call stack size exceeded

// Why: 100,000 frames * (size of one frame in bytes) exceeds the stack's memory limit.
// The stack is a fixed-size region. Filling it is a memory error, not a logic error.
```

**SE lens:** The error message "Maximum call stack size exceeded" (JavaScript), "RecursionError: maximum recursion depth exceeded" (Python), or "StackOverflowError" (Java) all mean the same thing at the machine level: the stack pointer has been decremented past the bottom of the allocated stack region. The OS detects this (via a guard page — a page of memory below the stack that triggers a trap when written) and kills the process. In production systems, stack overflows are caused by: unbounded recursion, mutually recursive functions with no base case, or accidentally infinite indirect call chains. They are always fatal.

## What closures capture — and where

A closure is a function that captures variables from the scope in which it was created. Understanding what "capture" means at the machine level explains why closures can outlive the function that created them.

```javascript
function makeCounter(start) {
  let count = start      // count lives in makeCounter's stack frame... or does it?

  return function increment() {
    count++
    return count
  }
}

const counter = makeCounter(10)
// makeCounter has returned — its stack frame is gone.
// But: counter() still works. count is still accessible.
// Where is count?
```

```text
The answer: count was MOVED TO THE HEAP.

When the JavaScript engine detects that `count` is referenced by an inner function
that escapes the current function (is returned or stored), it allocates `count`
on the heap instead of the stack. The inner function holds a reference to this
heap allocation.

This heap allocation is the "closure environment" — the captured variables.

counter()   → count becomes 11, returns 11
counter()   → count becomes 12, returns 12

count persists because it is on the heap, not the stack.
The garbage collector will not free it as long as `counter` holds a reference to it.

This is also why closures can cause memory leaks:
  If `counter` is accidentally kept alive (stored in a global, attached to a DOM element),
  the heap allocation for `count` is kept alive with it.
```

**CS lens:** The transformation the JavaScript engine performs — detecting that a variable escapes its lexical scope and promoting it from stack to heap — is called **escape analysis**. It is an optimisation concern: stack allocation is faster than heap allocation. A well-optimised engine performs escape analysis to keep as many variables on the stack as possible, promoting to the heap only when necessary. The performance difference: allocating on the stack is adjusting the stack pointer (a single instruction); allocating on the heap requires finding a free block, potentially triggering GC.

**Common mistakes:**
- Assuming a closure captures the value at creation time — it captures the variable (the heap slot), not the value. If the variable changes, the closure sees the new value.
- Creating many closures in a loop without realising each one captures the same variable — a classic bug where all loop iterations share the same loop counter because the variable was captured, not its value at iteration time.

**Debug tip:** When debugging a closure bug (the wrong value is seen inside a closure), check which variable is captured, not which value. Add `console.log('captured:', varName)` at the moment of capture AND at the moment of use to see if they diverge.

## Challenge: trace_call_stack

Reason about what the call stack contains at a given moment, and predict closure behaviour.

```challenge
function multiply(a, b) {
  return a * b
}

function applyTwice(fn, value) {
  const first  = fn(value, 2)
  const second = fn(first, 3)
  return second
}

function makeAdder(addend) {
  return (n) => n + addend
}

const result = applyTwice(multiply, 5)
const addFive = makeAdder(5)
const addFiveResult = addFive(10)

const stackQuestions = {
  // When multiply(5, 2) is executing, what are the two frames on the call stack above main?
  // List them as an array, innermost (top of stack) first.
  framesWhenMultiplyRuns: [],   // e.g. ['innerFn', 'outerFn']

  // What does applyTwice(multiply, 5) return?
  applyTwiceResult: 0,

  // What does addFive(10) return?
  addFiveResult: 0,

  // When addFive(10) runs, where does `addend` live — stack or heap?
  addendLocation: '',   // 'stack' or 'heap'
}
```

```test
const q = stackQuestions
assert q.framesWhenMultiplyRuns.length === 2
assert q.framesWhenMultiplyRuns[0].toLowerCase().includes('multiply')
assert q.framesWhenMultiplyRuns[1].toLowerCase().includes('applytwice') || q.framesWhenMultiplyRuns[1].toLowerCase().includes('apply')
assert q.applyTwiceResult === 30
assert q.addFiveResult === 15
assert q.addendLocation === 'heap'
```
