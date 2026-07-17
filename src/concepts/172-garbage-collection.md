---
concept: 172-garbage-collection
name: Garbage Collection
---

## Definition

Garbage collection (GC) is an automatic memory management process that
identifies heap-allocated objects no longer reachable from anywhere a
running program could access them, and reclaims their memory — freeing
developers from manually tracking and releasing every allocation
themselves.

## Problem

Manually managing memory (explicitly allocating AND explicitly freeing
every object, as in C) is error-prone — forgetting to free something
causes a memory leak (memory that's no longer needed but never reclaimed),
while freeing something too early (while it's still in use elsewhere)
causes a dangling-reference crash. Garbage collection automates this: the
runtime tracks what's still reachable and reclaims everything else,
eliminating both classes of bug (at some runtime performance cost).

## Execution

A variable references a heap object — the object is REACHABLE (something
can still get to it)
↓
A second variable references the SAME object — still reachable via
either variable
↓
One reference is removed, but the object is STILL reachable via the
remaining one — not eligible for collection yet
↓
The LAST reference is removed — now NOTHING in the program can reach that
object anymore
↓
The garbage collector eventually notices the object is unreachable and
reclaims its memory — the exact TIMING of this isn't something the
program controls or can rely on

## Computer Science

Most garbage collectors work by conceptually starting from a set of
"roots" (currently active local variables, global variables) and tracing
every reachable object outward from there — anything NOT reached by this
trace is, by definition, garbage, since nothing in the running program
could possibly access it anymore, even indirectly.

Tags: Reachability, Root set, Tracing garbage collection, Automatic memory management

## Software Engineering

Garbage collection doesn't eliminate ALL memory problems — a "logical"
memory leak can still happen if a program keeps an unintended REFERENCE to
an object alive (e.g., forgetting to remove an event listener, or an
ever-growing cache with no eviction), since the GC correctly considers it
reachable (and therefore not garbage) even though the program logically no
longer needs it.

Tags: Logical memory leaks, Event listener cleanup, Cache eviction

## Common Mistakes

- Assuming garbage collection makes memory leaks impossible — a leak can still occur if something (a global cache, a lingering event listener) keeps holding a reference to data that's logically no longer needed, since the GC only reclaims truly UNREACHABLE memory.
- Trying to control the exact TIMING of garbage collection in normal application code — the GC decides when to run based on its own internal heuristics, and relying on precise collection timing is both unsupported and unreliable.

## Exercises

- Trace through the example above and explain specifically why the object becomes eligible for collection only AFTER the second reference is removed, not right after the first.
- Identify one way an unintended reference (an event listener, a growing cache) could keep an object "reachable" and therefore un-collected, even after a program logically no longer needs it.

## javascript

```javascript
// Simulating reachability tracking directly (a simplified reference-count
// based reachability check), since JS doesn't expose the real GC or memory
// addresses -- this demonstrates the underlying reachability CONCEPT.
class TrackedObject {
  static registry = new Map()
  static create(id) {
    TrackedObject.registry.set(id, { refs: 0 })
    return id
  }
  static addRef(id) { TrackedObject.registry.get(id).refs++ }
  static removeRef(id) { TrackedObject.registry.get(id).refs-- }
  static isReachable(id) { return TrackedObject.registry.get(id).refs > 0 }
}

const objId = TrackedObject.create('obj1')
TrackedObject.addRef(objId)   // first reference
TrackedObject.addRef(objId)   // second reference to the SAME object

console.log(TrackedObject.isReachable(objId))   // true -- reachable via 2 references

TrackedObject.removeRef(objId)   // one reference removed
console.log(TrackedObject.isReachable(objId))   // true -- STILL reachable via the remaining reference

TrackedObject.removeRef(objId)   // the LAST reference removed
console.log(TrackedObject.isReachable(objId))   // false -- now unreachable, eligible for garbage collection
```
Walkthrough: the object stays reachable after the FIRST reference is
removed, since a second reference still points to it — only once BOTH
references are removed does `isReachable` become `false`, demonstrating
that garbage collection eligibility depends on ALL references being gone,
not just one.

## python

```python
import sys

obj = {'data': 'important'}
print(sys.getrefcount(obj) - 1)   # subtract 1 for the temporary reference getrefcount's own argument creates

obj2 = obj   # a second reference to the SAME object
print(sys.getrefcount(obj) - 1)   # one more than before -- 2 real references now (obj and obj2)

del obj   # remove one reference
print(sys.getrefcount(obj2) - 1)  # back down to 1 -- obj2 keeps it alive; NOT eligible for collection yet

del obj2   # remove the LAST reference -- the object becomes unreachable and eligible for collection
print('object fully unreachable now')
```
Walkthrough: `sys.getrefcount` (minus 1, for the temporary reference the
call itself creates) shows the object's real reference count dropping
from 2 to 1 after `del obj`, and the object becomes fully unreachable only
after `del obj2` removes the last remaining reference — directly
observable evidence of Python's actual reference-counting collection
mechanism (see Reference Counting) in action.
