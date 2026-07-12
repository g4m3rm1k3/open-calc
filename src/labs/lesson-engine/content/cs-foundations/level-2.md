---
series: cs-foundations
level: 2
title: Memory — The Stack and the Heap
lang: javascript
---

# Memory — The Stack and the Heap

Every value in your program lives somewhere in memory. Where it lives — and how that location is managed — determines how long the value exists, how fast it can be accessed, and what happens when a function returns or an object is no longer needed.

Memory in a running program is divided into regions, each with a different purpose and different management rules. The two that matter most for understanding program behaviour are the **stack** and the **heap**. These are not language abstractions — they are features of the physical machine and operating system that every language runtime uses.

By the end of this lesson you will understand what the stack and heap are, how function calls use the stack, why heap allocation requires garbage collection, and what "stack overflow" and "memory leak" mean at the machine level.

## The stack: automatic, fast, and scoped

The stack is a region of memory managed by the CPU. It grows downward (toward lower addresses) and shrinks upward as functions are called and return. The CPU maintains a **stack pointer** register that always points to the top of the stack.

```text
STACK FRAME — what gets pushed when a function is called:
  — The return address: where to jump back to when this function returns.
  — The previous stack pointer (so the caller's frame can be restored).
  — Local variables: all variables declared inside the function.
  — Parameters: the values passed to the function.

When a function RETURNS:
  — Its entire frame is popped from the stack.
  — The local variables cease to exist.
  — The stack pointer moves back to the caller's frame.
  — Execution resumes at the return address.

This is why local variables cannot be accessed after a function returns:
  they no longer exist. The stack frame that held them was popped.
```

```text
Example: three nested function calls

  main() calls processOrder() which calls validateOrder()

  Stack (bottom = most recent call on top):
    ┌─────────────────────────────┐ ← stack pointer (top of stack)
    │ validateOrder frame:        │
    │   order = { ... }           │
    │   return address → process  │
    ├─────────────────────────────┤
    │ processOrder frame:         │
    │   orderId = 'ord-42'        │
    │   result = ...              │
    │   return address → main     │
    ├─────────────────────────────┤
    │ main frame:                 │
    │   args: ...                 │
    │   return address → OS       │
    └─────────────────────────────┘ ← bottom of stack

  When validateOrder returns:
    Its frame is popped. Stack pointer moves down one frame.
    Execution resumes in processOrder at the return address.
```

```text
STACK OVERFLOW:
  The stack has a fixed maximum size (typically 1–8 MB).
  Infinite recursion = infinite frames pushed = stack overflows:

  function infinite() { return infinite() }
  infinite()   // RangeError: Maximum call stack size exceeded

  Each recursive call pushes a frame. The stack fills up.
  "Call stack size exceeded" IS "stack overflow" — the stack is full.
```

**CS lens:** The stack is a classic LIFO (last-in, first-out) data structure, implemented directly in hardware. The CPU's PUSH and POP instructions (or equivalent) manage it. The reason function calls map so naturally to a stack is that they are inherently nested — the most recently called function always returns before the function that called it. LIFO matches this structure exactly. This is why the call stack and the data structure called "stack" are the same concept.

## The heap: flexible, manual/managed, slower

The heap is the general-purpose region of memory for values that must persist beyond a function call, or whose size is not known at compile time.

```javascript
// In JavaScript, objects and arrays always live on the heap.
// The variable holds a reference (a memory address), not the value itself.

function makeUser(name, age) {
  const user = { name, age }    // allocated on the heap — user is a reference to it
  return user                    // returns the reference — the object persists after the function returns
}

const u = makeUser('Alice', 30)
// The stack frame of makeUser is gone.
// But the { name: 'Alice', age: 30 } object is still alive on the heap.
// `u` holds the heap address where it lives.
```

```text
STACK vs HEAP:
┌──────────────────────────────────────────────────────────────┐
│               STACK                  │        HEAP           │
├──────────────────────────────────────┼───────────────────────┤
│ Managed by:    CPU (automatically)   │ Runtime (GC in JS)    │
│ Lifetime:      Until function returns│ Until no references   │
│ Speed:         Extremely fast        │ Slower (allocation)   │
│ Stores:        Local variables,      │ Objects, arrays,      │
│                function parameters   │ closures, strings     │
│ Size limit:    Small (1–8 MB)        │ Large (limited by RAM)│
│ Overflow:      Stack overflow        │ Memory leak / OOM     │
└──────────────────────────────────────┴───────────────────────┘

In JavaScript:
  Numbers, booleans, null, undefined → stored directly on the stack (by value)
  Objects, arrays, functions, strings → stored on the heap; variable holds reference
```

## Garbage collection: automatic heap management

Unlike the stack (automatically managed by the CPU), the heap must be managed. In languages like C, the programmer manually allocates and frees memory. In JavaScript, the runtime's garbage collector (GC) does this automatically.

```text
HOW GC WORKS (mark-and-sweep):
  1. MARK: Starting from all "root" references (global variables, current call stack),
     trace every reachable object. Mark each one as "live."
  2. SWEEP: Scan the entire heap. Any object NOT marked as live is unreachable.
     Free its memory — it can never be accessed again.

"Reachable" means: there exists a chain of references from a root to this object.
"Unreachable" means: no reference path leads to this object. It is dead memory.

When an object becomes unreachable:
  function createAndDiscard() {
    const big = new Array(1_000_000).fill(0)   // allocated on heap
    // big goes out of scope at end of function
  }
  createAndDiscard()
  // big is no longer reachable — GC will free its memory on the next collection.
```

```text
MEMORY LEAK: an object that should be unreachable but still has a reference keeping it alive.

Common causes in JavaScript:
  — Event listeners not removed: button.addEventListener('click', handler)
    If the button is removed from the DOM but the handler still references a large object,
    that object cannot be collected. The listener keeps it alive.
  — Global variables that accumulate: cache[key] = data without ever clearing old entries.
  — Closures capturing large objects unintentionally.

Sign of a memory leak: memory usage grows continuously and never shrinks.
The GC cannot collect what it cannot see as unreachable.
```

**SE lens:** Understanding the stack/heap distinction is essential for diagnosing two categories of production failures: stack overflows (always caused by unbounded recursion or very deep call stacks) and memory leaks (always caused by unexpected references keeping objects alive on the heap). A stack overflow causes an immediate, loud error. A memory leak is silent and accumulates over time — the program uses more and more memory until the OS kills it or the server runs out of RAM. Both require understanding memory regions to diagnose correctly.

**Common mistakes:**
- Confusing passing by value vs by reference in JavaScript — primitives (numbers, booleans) are copied when passed to a function; objects are passed by reference (the address is copied). Mutating an object inside a function mutates the original because both references point to the same heap allocation.
- Creating large objects in tight loops — each iteration allocates on the heap; the GC must eventually collect all of them. Reusing a single object or using arrays instead of many small objects reduces GC pressure.

**Debug tip:** When memory grows unboundedly, use the browser's or Node's memory profiler. Take a heap snapshot before and after an operation. Objects that appear in the "after" snapshot but not the "before" — and that should have been collected — are your leak. Check what reference is keeping them alive.

## Challenge: stack_and_heap

Reason about where values live.

```challenge
function outer() {
  let x = 10                   // Q1: stack or heap?
  const obj = { value: x }     // Q2: where does `obj` itself live? where does { value: 10 } live?
  return inner(obj)
}

function inner(param) {
  return param.value * 2       // Q3: after outer returns, can param still be accessed?
}

const result = outer()

const memory = {
  // Q1: where does `x` live while outer() is executing?
  x_location: '',         // 'stack' or 'heap'
  // Q2a: where does the variable `obj` (the reference) live?
  obj_reference_location: '',  // 'stack' or 'heap'
  // Q2b: where does the object { value: 10 } live?
  obj_object_location: '',     // 'stack' or 'heap'
  // Q3: after outer() returns, can the `param` variable in inner() still be accessed?
  param_after_return: '',      // 'yes' or 'no' — and why
  // What is the value of result?
  result_value: 0
}
```

```test
assert memory.x_location === 'stack'
assert memory.obj_reference_location === 'stack'
assert memory.obj_object_location === 'heap'
assert memory.param_after_return.toLowerCase().startsWith('no')
assert memory.result_value === 20
```
