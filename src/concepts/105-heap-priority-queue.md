---
concept: 105-heap-priority-queue
name: Heap / Priority Queue
---

## Definition

A heap is a tree-shaped structure that keeps the smallest (or largest)
element always accessible at the root, letting "find or remove the
minimum" happen in O(log n) instead of scanning every element.

## Problem

Repeatedly needing "the smallest remaining item" — task scheduling by
priority, always processing the next-cheapest edge in a graph algorithm —
is slow if it requires re-scanning an entire unsorted collection every
single time, O(n) per lookup. A heap maintains a partial ordering (parent
always smaller than its children, in a min-heap) that's much cheaper to
maintain than full sorting, while still making the minimum instantly
accessible.

## Execution

Insert 5, 3, 8, 1 into an empty min-heap, one at a time
↓
insert(5): heap = [5]
↓
insert(3): added at the end, then "bubbles up" past 5 since it's smaller → heap = [3, 5]
↓
insert(8): added at the end, stays put (bigger than its parent) → heap = [3, 5, 8]
↓
insert(1): added at the end, bubbles all the way up to the root → heap = [1, 3, 8, 5]
↓
peek() → 1, always the current minimum, accessible in O(1) without scanning anything

## Computer Science

A binary heap is conventionally stored in a plain array, not an explicit
tree of nodes — a node at array index i has its children at indices 2i+1
and 2i+2, so navigating "up to the parent" or "down to a child" is pure
arithmetic, no pointers needed. Insert and remove-minimum both cost
O(log n), since they only ever need to "bubble" an element up or down
along one path of the tree's height.

Tags: Array-based tree, Heap property, Bubble up/down, Logarithmic operations

## Software Engineering

A heap is the standard structure behind a priority queue — a queue where
the "next" item is always the highest or lowest priority one, not the
oldest — used in task schedulers, Dijkstra's shortest-path algorithm, and
any "always process the best candidate next" algorithm.

Tags: Priority queue, Task scheduling, Dijkstra's algorithm

## Common Mistakes

- Assuming a heap keeps its elements FULLY sorted — it only guarantees the root is the min (or max); the rest of the heap is only partially ordered, not sorted like a sorted array would be.
- Implementing "remove minimum" by just deleting the root without properly restructuring the rest of the heap — this breaks the heap property for everything below it, corrupting future operations.

## Exercises

- Trace by hand what "bubbling up" looks like when inserting `1` into a heap that already contains `[3, 5, 8]`.
- Implement `extractMin()` (remove and return the root, then restore the heap property) and confirm repeatedly calling it returns elements in sorted order.

## javascript

```javascript
class MinHeap {
  #items = []
  insert(value) {
    this.#items.push(value)
    let i = this.#items.length - 1
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      if (this.#items[parent] <= this.#items[i]) break
      ;[this.#items[parent], this.#items[i]] = [this.#items[i], this.#items[parent]]
      i = parent
    }
  }
  peek() { return this.#items[0] }
}

const heap = new MinHeap()
for (const v of [5, 3, 8, 1]) heap.insert(v)
console.log(heap.peek())   // 1 — the minimum, always at the root
```
Walkthrough: each `insert` adds the new value at the end of the array,
then repeatedly swaps it with its parent ("bubbling up") as long as it's
smaller than that parent — stopping the instant the heap property (parent
≤ child) holds again. `peek()` just reads index 0, since the minimum is
always guaranteed to end up there.

## python

```python
class MinHeap:
    def __init__(self):
        self._items = []

    def insert(self, value):
        self._items.append(value)
        i = len(self._items) - 1
        while i > 0:
            parent = (i - 1) // 2
            if self._items[parent] <= self._items[i]:
                break
            self._items[parent], self._items[i] = self._items[i], self._items[parent]
            i = parent

    def peek(self):
        return self._items[0]


heap = MinHeap()
for v in [5, 3, 8, 1]:
    heap.insert(v)
print(heap.peek())   # 1 -- the minimum, always at the root
```
Walkthrough: identical array-based bubble-up mechanics as the JavaScript
version — Python's built-in `heapq` module implements this same idea
directly on a plain list, which is why it operates on lists rather than a
dedicated heap class.
