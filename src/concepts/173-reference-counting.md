---
concept: 173-reference-counting
name: Reference Counting
---

## Definition

Reference counting is a memory management technique that tracks how many
references point to each object — incrementing the count whenever a new
reference is created, decrementing it whenever one is removed, and
immediately freeing the object's memory the instant its count reaches
zero.

## Problem

Some memory management needs immediate, predictable cleanup (rather than
waiting for a separate collection pass at an unpredictable time) —
reference counting frees memory the exact moment it becomes unreachable,
since going from 1 reference to 0 is a precise, immediately-detectable
event, unlike tracing garbage collection (see Garbage Collection), which
typically runs periodically rather than instantly upon an object becoming
unreachable.

## Execution

An object is created — count = 1 (the variable itself is a reference)
↓
A second variable references the SAME object — count = 2
↓
One reference is removed — count = 1 (the other reference still holds
one)
↓
The last reference is removed — count = 0 — the INSTANT the count hits
zero, the object's memory is freed immediately, no separate collection
pass needed
↓
Circular reference problem: if object A references object B, and B
references A right back, but NOTHING ELSE references either of them,
their counts never naturally reach zero (each is kept alive by the other)
— pure reference counting alone can't collect this kind of cycle, and
needs a supplementary cycle detector

## Computer Science

Reference counting's core tradeoff versus tracing garbage collection is
immediacy versus completeness — it reclaims memory the INSTANT it becomes
unreachable (good for predictability), but cannot, by itself, detect
reference CYCLES, since each object in a cycle always has at least one
reference (from its cycle partner) even when the whole cycle is
unreachable from anywhere else in the program.

Tags: Reference cycles, Immediate deallocation, Cycle detection

## Software Engineering

CPython (the standard Python implementation) uses reference counting as
its PRIMARY memory management mechanism, supplemented by a separate
cycle-detecting garbage collector specifically to catch the reference
cycles that pure reference counting would otherwise miss — understanding
this explains why Python objects are usually freed immediately when they
go out of scope, unlike languages relying purely on periodic tracing GC.

Tags: CPython, Cycle detector, Immediate cleanup, Hybrid memory management

## Common Mistakes

- Assuming reference counting alone can handle EVERY memory cleanup scenario — reference cycles (two or more objects referencing each other, forming a loop with no external reference) are a real blind spot that requires a supplementary mechanism.
- Creating unintentional circular references (e.g., a parent object holding a reference to a child, and the child holding a reference back to its parent) without realizing this can complicate cleanup — while CPython's cycle detector does handle this case, understanding that a cycle exists helps explain why an object doesn't get cleaned up the instant you'd naively expect.

## Exercises

- Trace through the example above and explain specifically WHY the object's memory is freed the instant the last reference is removed, rather than at some later, unpredictable point.
- Explain why a circular reference between two objects, with no external reference to either, still counts as "unreachable" from the rest of the program even though their reference counts never hit zero on their own.

## javascript

```javascript
// Simulating reference counting directly (JS itself uses tracing GC, not
// reference counting, so this models the MECHANISM conceptually).
class RefCounted {
  #count = 0
  #freed = false
  addRef() { this.#count++ }
  removeRef() {
    this.#count--
    if (this.#count === 0) this.#freed = true   // freed the INSTANT the count hits zero
  }
  get isFreed() { return this.#freed }
  get count() { return this.#count }
}

const obj = new RefCounted()
obj.addRef()   // first reference -- count = 1
console.log(obj.count, obj.isFreed)   // 1 false

obj.addRef()   // second reference -- count = 2
console.log(obj.count, obj.isFreed)   // 2 false

obj.removeRef()   // one reference removed -- count = 1
console.log(obj.count, obj.isFreed)   // 1 false -- still alive, one reference remains

obj.removeRef()   // last reference removed -- count = 0
console.log(obj.count, obj.isFreed)   // 0 true -- freed IMMEDIATELY the instant the count hit zero
```
Walkthrough: `isFreed` flips to `true` at the EXACT moment `count` reaches
`0`, immediately after the second `removeRef()` call — no separate
collection pass or delay involved, demonstrating reference counting's
defining characteristic: memory is reclaimed the instant it becomes
provably unreferenced.

## python

```python
import sys

obj = object()
obj2 = obj   # a second reference to the SAME object
count_with_two_refs = sys.getrefcount(obj) - 1   # subtract 1 for getrefcount's own temporary argument reference
print(count_with_two_refs)   # 2 -- obj and obj2 both reference it

del obj2   # remove one reference
print(sys.getrefcount(obj) - 1)   # 1 -- back down to a single reference (obj)

# del obj here would drop the count to 0 -- CPython frees the object's
# memory IMMEDIATELY at that point, not at some later garbage-collection pass
```
Walkthrough: Python's real `sys.getrefcount` (adjusted by 1, since calling
it creates its own temporary reference) directly shows the reference
count dropping from 2 to 1 as `obj2` is deleted — this is CPython's actual
reference-counting mechanism, the same one that frees memory the instant
a count reaches zero, unlike languages relying purely on periodic tracing
GC.
