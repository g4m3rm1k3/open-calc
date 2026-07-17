---
concept: 069-queue
name: Queue
---

## Definition

A queue is a data structure that only allows adding items at one end (the
"back") and removing them from the other end (the "front") — meaning the
first item added is always the first one removed (FIFO: first in, first
out).

## Problem

Some data needs to be processed in the exact order it arrived — handling
requests in the order they were received, or visiting the nodes of a graph
one "layer" at a time. A queue enforces exactly that: enqueue (add to the
back) and dequeue (remove from the front), never letting a later arrival be
processed before an earlier one.

## Execution

enqueue(1) → queue holds [1]
↓
enqueue(2) → queue holds [1, 2]
↓
enqueue(3) → queue holds [1, 2, 3]
↓
dequeue() → returns 1 (the FIRST item added), queue holds [2, 3]
↓
dequeue() → returns 2, queue holds [3]
↓
peek() → returns 3 without removing it

## Computer Science

A queue is the structure breadth-first search (BFS) uses to visit a graph
one layer at a time — every node at the current distance is dequeued and
processed before any node at the next distance is enqueued, which is exactly
what guarantees BFS visits nodes in increasing order of distance from the
start. Enqueue and dequeue are both O(1) when the queue is implemented
correctly.

Tags: FIFO, Breadth-first search, Level-order traversal, Constant-time operations

## Software Engineering

Naively implementing dequeue by removing from the front of a plain array is
O(n), since every remaining element must shift down one position — a real,
easy-to-miss performance trap, since it *looks* like a simple O(1)
operation. A properly implemented queue uses an index pointer, a circular
buffer, or a doubly linked list to keep both ends genuinely O(1).

Tags: Amortized O(1), Circular buffer, Task scheduling, Message queues

## Common Mistakes

- Removing from the front of a plain array or list and assuming it's O(1) — it requires shifting every remaining element, making it O(n), a common performance trap because the code looks identical to a real O(1) operation.
- Confusing a queue's FIFO order with a stack's LIFO order — using one where the other was needed silently processes items in the wrong order, with no error raised at all.

## Exercises

- Use a queue to implement breadth-first search on a small graph, and confirm it visits nodes in increasing order of distance from the start node.
- Compare dequeuing 10,000 items using an array's front-removal versus the index-pointer approach in the JavaScript example below — measure the actual time difference.

## javascript

```javascript
class Queue {
  #items = []
  #headIndex = 0
  enqueue(item) { this.#items.push(item) }
  dequeue() {
    if (this.#headIndex >= this.#items.length) return undefined
    const item = this.#items[this.#headIndex]
    this.#headIndex++
    return item
  }
  peek() { return this.#items[this.#headIndex] }
}

const q = new Queue()
q.enqueue(1)
q.enqueue(2)
q.enqueue(3)
console.log(q.dequeue())   // 1 — first one in, first one out
console.log(q.dequeue())   // 2
console.log(q.peek())      // 3 — still in the queue, not removed
```
Walkthrough: `enqueue` always adds to the end, but `dequeue` tracks a
separate `#headIndex` pointer instead of physically removing the front
element — this keeps both operations O(1), avoiding the shift-every-element
cost a naive array-front-removal-based queue would pay on every dequeue.

## python

```python
from collections import deque

q = deque()
q.append(1)
q.append(2)
q.append(3)
print(q.popleft())   # 1 -- first one in, first one out
print(q.popleft())   # 2
print(q[0])           # 3 -- still in the queue, not removed
```
Walkthrough: Python's `collections.deque` is a double-ended queue built
specifically so that both `append` (add to the back) and `popleft` (remove
from the front) are O(1) — unlike a plain list, whose front-removal would be
O(n) for exactly the reason the JavaScript walkthrough's `#headIndex` trick
avoids.
