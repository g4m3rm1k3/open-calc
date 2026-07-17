---
concept: 171-stack-vs-heap
name: Stack vs Heap
---

## Definition

The stack and heap are two different regions of memory a program uses —
the stack stores function call frames and local variables in a strict
last-in-first-out order (fast, automatically cleaned up when a function
returns), while the heap stores dynamically-allocated data that can
outlive the function that created it (more flexible, but requires
explicit or automatic cleanup).

## Problem

Not all data has the same lifetime needs — a local variable that's only
needed during a single function call can be cleaned up trivially the
instant that function returns, but an object that needs to be shared,
returned, or kept alive beyond a single function call needs a different
kind of storage that doesn't disappear when the creating function exits.
The stack handles the first case efficiently; the heap handles the
second.

## Execution

A function computes a sum from two simple local values — those values are
pushed onto the STACK as part of this call's frame
↓
The function returns — its ENTIRE stack frame (including its locals) is
popped off and discarded instantly, no cleanup logic needed
↓
A different function returns a brand new object — the object literal is
allocated on the HEAP, since it needs to potentially outlive this
function call (it's being returned)
↓
The caller holds a reference (stored on the stack) POINTING to the
object's actual data (which lives on the heap)
↓
Even though the creating function's own stack frame is popped when it
returns, the object it created on the heap survives, since the caller
still references it

## Computer Science

The stack's strict LIFO discipline (calls nest and return in perfectly
reversed order) is exactly what makes stack allocation nearly free — a
function's entire frame can be reclaimed just by moving a single pointer
back, with no scanning or bookkeeping required; the heap has no such
guaranteed ordering (objects can be created and destroyed in ANY order,
independent of the call stack), which is why heap memory needs a more
sophisticated cleanup mechanism (see Garbage Collection).

Tags: LIFO, Call frames, Dynamic allocation, Memory lifetime

## Software Engineering

In garbage-collected languages like JavaScript and Python, developers
rarely think explicitly about stack vs. heap allocation (the runtime
decides automatically), but the underlying distinction still explains
real, observable behavior — why a very deep, unbounded recursive call can
overflow the stack (a fixed-size region) while a program can still
allocate a huge number of objects on the heap before running out of
memory.

Tags: Stack overflow, Automatic allocation decisions, Recursion depth limits

## Common Mistakes

- Assuming ALL data in JS/Python lives on the heap, or ALL data lives on the stack — in practice, primitive local values typically live on the stack (or are optimized similarly), while objects/arrays are heap-allocated with stack-held references pointing to them; the runtime manages this automatically, but the underlying distinction still shapes behavior.
- Writing deep, unbounded recursion without a base case and being surprised by a "stack overflow" error — this is a direct consequence of the stack being a fixed-size region that grows with every nested call, unlike the heap.

## Exercises

- Explain why a function's simple local values can be cleaned up instantly when it returns, while an object it returns cannot be cleaned up the same way.
- Look up what causes a "stack overflow" error, and explain specifically why it relates to the stack being a bounded region rather than the heap.

## javascript

```javascript
// Demonstrating the stack-frame-popped-instantly vs. heap-object-outlives-
// its-creating-function distinction conceptually (JS doesn't expose raw
// memory addresses, so this traces the OBSERVABLE lifetime difference).
function computeSum() {
  let a = 5   // local value -- conceptually stack-allocated, part of THIS call's frame
  let b = 10
  return a + b
}   // when this function returns, its entire frame (a, b) is discarded instantly

console.log(computeSum())   // 15 -- a and b never exist outside this single call

function makeUser() {
  return { name: 'Alice' }   // this object needs to OUTLIVE this function call, since it's being returned
}

const user = makeUser()   // makeUser's own call frame is already gone, but the object it created still exists
console.log(user.name)    // 'Alice' -- the heap-allocated object survived past its creating function's return
```
Walkthrough: `computeSum`'s locals (`a`, `b`) are only ever needed during
that one call and vanish the instant it returns — there's no way to
access them afterward, matching stack-frame cleanup. `makeUser`'s
returned object, by contrast, is still fully accessible via `user` long
after `makeUser`'s own call has completed, exactly the kind of
longer-lived data the heap exists to hold.

## python

```python
def compute_sum():
    a = 5   # local value -- conceptually stack-allocated, part of THIS call's frame
    b = 10
    return a + b   # when this function returns, its entire frame (a, b) is discarded instantly


print(compute_sum())   # 15 -- a and b never exist outside this single call


def make_user():
    return {'name': 'Alice'}   # this object needs to OUTLIVE this function call, since it's being returned


user = make_user()   # make_user's own call frame is already gone, but the object it created still exists
print(user['name'])   # Alice -- the heap-allocated object survived past its creating function's return
```
Walkthrough: identical stack-frame-vanishes vs. heap-object-survives
contrast as the JavaScript version — `compute_sum`'s locals are gone the
instant it returns, while `make_user`'s returned dictionary remains fully
accessible via `user` long after.
