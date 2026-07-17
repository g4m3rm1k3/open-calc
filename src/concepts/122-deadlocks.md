---
concept: 122-deadlocks
name: Deadlocks
---

## Definition

A deadlock occurs when two or more threads or processes are each waiting
for a resource the other holds, so none of them can ever proceed — every
party is stuck waiting forever for something that will never be released.

## Problem

When multiple threads each need to acquire more than one lock or resource
to do their work, acquiring them in different orders can lead to a
situation where each thread holds one resource and waits for another —
with no thread willing to give up what it already has, none can ever
finish.

## Execution

Thread A acquires Lock1, then tries to acquire Lock2
↓
Thread B acquires Lock2, then tries to acquire Lock1 (at roughly the same time)
↓
Thread A is now waiting for Lock2 (held by B) — Thread B is waiting for
Lock1 (held by A)
↓
Neither thread will release what it holds until it gets what it's waiting
for — neither ever will — DEADLOCK, both stuck forever

## Computer Science

A deadlock requires four conditions simultaneously: mutual exclusion (a
resource can only be held by one thread at a time), hold and wait (a
thread holds one resource while waiting for another), no preemption (a
resource can't be forcibly taken away), and circular wait (a cycle of
threads each waiting on the next). Breaking any ONE of these four
conditions prevents deadlock entirely — the most common fix is eliminating
circular wait by enforcing a consistent lock-acquisition order across every
thread.

Tags: Mutual exclusion, Hold and wait, Circular wait, Lock ordering

## Software Engineering

The standard prevention technique is simple in principle but requires
discipline everywhere locks are used: always acquire multiple locks in the
same globally-agreed order across every thread in the codebase. If every
thread always acquires Lock1 before Lock2, never the reverse, the
circular-wait condition becomes structurally impossible.

Tags: Lock ordering, Deadlock prevention, Resource allocation

## Common Mistakes

- Acquiring locks in an inconsistent order across different parts of the codebase — even if most code acquires locks in the "right" order, a single piece of code acquiring them in reverse order anywhere is enough to create a possible deadlock.
- Holding a lock for longer than necessary — this increases the window during which a deadlock-causing interleaving could occur, even if it doesn't cause one directly by itself.

## Exercises

- Rewrite the deadlock example so BOTH threads acquire locks in the same order, and confirm no deadlock is possible with that ordering.
- Identify which of the four deadlock conditions is eliminated by enforcing a consistent lock order.

## javascript

```javascript
// Represents "who holds what" and "who is waiting for what" as a wait-for graph,
// then detects whether a deadlock (a cycle) exists -- demonstrating the CONDITION
// without actually spawning threads that would really hang forever.
const holds = { threadA: 'lock1', threadB: 'lock2' }
const waitsFor = { threadA: 'lock2', threadB: 'lock1' }   // each wants what the OTHER holds

function heldBy(resource) {
  return Object.keys(holds).find(thread => holds[thread] === resource)
}

function hasCycle(thread, visited = new Set()) {
  if (visited.has(thread)) return true   // came back to a thread already in this chain -- cycle!
  visited.add(thread)
  const wantedResource = waitsFor[thread]
  const blockingThread = heldBy(wantedResource)
  if (!blockingThread) return false   // resource is free, no wait needed
  return hasCycle(blockingThread, visited)
}

console.log(hasCycle('threadA'))   // true — A waits for lock2 (held by B), B waits for lock1 (held by A): a cycle
```
Walkthrough: rather than spawning real threads that would actually hang
forever (impossible to demonstrate safely), this models who holds what and
who is waiting for what as a graph, then follows the chain of "waiting
for" relationships — if it ever loops back to a thread already in the
current chain, that's a cycle, which is exactly the circular-wait condition
that causes a real deadlock.

## python

```python
holds = {'thread_a': 'lock1', 'thread_b': 'lock2'}
waits_for = {'thread_a': 'lock2', 'thread_b': 'lock1'}   # each wants what the OTHER holds


def held_by(resource):
    for thread, held_resource in holds.items():
        if held_resource == resource:
            return thread
    return None


def has_cycle(thread, visited=None):
    if visited is None:
        visited = set()
    if thread in visited:
        return True   # came back to a thread already in this chain -- cycle!
    visited.add(thread)
    wanted_resource = waits_for[thread]
    blocking_thread = held_by(wanted_resource)
    if blocking_thread is None:
        return False   # resource is free, no wait needed
    return has_cycle(blocking_thread, visited)


print(has_cycle('thread_a'))   # True -- A waits for lock2 (held by B), B waits for lock1 (held by A): a cycle
```
Walkthrough: identical wait-for-graph cycle detection as the JavaScript
version — this safely demonstrates the exact structural condition that
causes a deadlock, without ever running code that would genuinely hang.
