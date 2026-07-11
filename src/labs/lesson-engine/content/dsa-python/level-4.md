---
series: dsa-python
level: 4
title: Queues & Deques
lang: python
---

# Queues & Deques

A queue is a First-In, First-Out (FIFO) structure — the first thing enqueued is the
first thing dequeued. Queues appear in scheduling, breadth-first search, event systems,
and any problem where order of arrival matters. A deque (double-ended queue) is the
generalization: you can add or remove from either end in O(1).

## The Queue Pattern with collections.deque

Python lists make poor queues. `list.pop(0)` removes from the front in O(n) because
every remaining element shifts left. `collections.deque` fixes this — it is a
doubly-linked list under the hood, so `appendleft` and `popleft` are O(1).

```python
from collections import deque

queue = deque()

queue.append("first")    # enqueue — add to right
queue.append("second")
queue.append("third")

print(queue)             # deque(['first', 'second', 'third'])
print(queue.popleft())   # "first"  — dequeue — remove from left
print(queue.popleft())   # "second"
print(queue)             # deque(['third'])
```

**CS lens:** A deque is a doubly-linked structure with O(1) append and popleft
because it holds a pointer to both ends. A Python list is a contiguous array —
removing from position 0 requires shifting every element down by one slot, which
is O(n). Choosing `deque` over `list` for queue operations is a structural correctness
choice, not a micro-optimisation.

**SE lens:** `collections.deque` is the standard library's answer to the mismatch
between `list`'s access pattern (random index) and queue's access pattern (front
removal). Using the right abstraction makes the code self-documenting: a `deque`
says "I will be used as a queue or deque"; a `list` says "I will be accessed by index."

Deques support both stack (LIFO) and queue (FIFO) operations. Appending and popping
from the right is a stack. Appending right and popping left is a queue. Appending
left and popping right is a queue in the other direction.

```python
from collections import deque

window = deque(maxlen=3)   # fixed-size window — oldest value auto-evicted
window.append(10)
window.append(20)
window.append(30)
print(window)              # deque([10, 20, 30], maxlen=3)
window.append(40)          # 10 is auto-evicted
print(window)              # deque([20, 30, 40], maxlen=3)
```

The `maxlen` parameter creates a sliding window with automatic eviction —
useful for rolling averages and recent-history buffers without manual cleanup.

## Challenge: rotate queue

A queue can be rotated by moving elements from the front to the back repeatedly.
Given a deque and an integer `k`, return a new deque that is the original rotated
right by `k` positions. Rotating right by 1 moves the last element to the front.
`deque([1, 2, 3, 4, 5])` rotated right by 2 becomes `deque([4, 5, 1, 2, 3])`.

Return a new deque — do not modify the input.

```challenge
from collections import deque

def rotate_queue(q, k):
    pass
```

```test
from collections import deque
assert rotate_queue(deque([1, 2, 3, 4, 5]), 2) == deque([4, 5, 1, 2, 3])
assert rotate_queue(deque([1, 2, 3, 4, 5]), 0) == deque([1, 2, 3, 4, 5])
assert rotate_queue(deque([1, 2, 3, 4, 5]), 5) == deque([1, 2, 3, 4, 5])
assert rotate_queue(deque([7, 8, 9]), 1) == deque([9, 7, 8])
assert rotate_queue(deque([42]), 10) == deque([42])
```

## Breadth-First Search with a Queue

BFS explores a graph level by level — first all nodes one step away, then all nodes
two steps away, and so on. The queue enforces this: newly discovered nodes are
added to the back and explored in the order they were discovered.

The BFS template works on any structure that can be modelled as a graph: trees,
grids, state machines, dependency graphs.

```python
from collections import deque

def bfs_shortest_path(graph, start, end):
    # graph is a dict: node -> list of neighbours
    queue = deque([(start, [start])])   # (current node, path to current node)
    visited = {start}

    while queue:
        node, path = queue.popleft()
        if node == end:
            return path
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append((neighbour, path + [neighbour]))

    return None   # no path exists

graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"],
}
print(bfs_shortest_path(graph, "A", "F"))  # ["A", "C", "F"]
```

**CS lens:** BFS uses a queue to guarantee that nodes are explored in order of their
distance from the start. The first time a node is reached via BFS, that path is the
shortest path (in terms of number of edges). A stack (DFS) does not have this property.

**SE lens:** The `visited` set is essential correctness infrastructure, not optional
optimisation. Without it, BFS revisits nodes indefinitely in cyclic graphs. The
visited set and the queue are inseparable — together they implement the BFS invariant.

```python
from collections import deque

def count_islands(grid):
    # Count connected groups of 1s in a 2D grid.
    rows, cols = len(grid), len(grid[0])
    visited = set()
    islands = 0

    def bfs_flood(r, c):
        queue = deque([(r, c)])
        visited.add((r, c))
        while queue:
            row, col = queue.popleft()
            for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
                nr, nc = row + dr, col + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr,nc) not in visited:
                    visited.add((nr, nc))
                    queue.append((nr, nc))

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r, c) not in visited:
                bfs_flood(r, c)
                islands += 1

    return islands

grid = [[1,1,0,0],[1,0,0,1],[0,0,1,1]]
print(count_islands(grid))  # 3
```

## Challenge: moving average

Given a stream of numbers and a window size `k`, compute the moving average of the
last `k` numbers after each new number arrives. Return the list of averages.

A moving average at each step is the average of the current element and the `k - 1`
elements before it. For the first `k - 1` elements, the window is smaller —
average the elements you have so far. Return a list of floats, one per input element.

```challenge
def moving_average(numbers, k):
    pass
```

```test
assert moving_average([1, 2, 3, 4, 5], 3) == [1.0, 1.5, 2.0, 3.0, 4.0]
assert moving_average([10, 20, 30], 2) == [10.0, 15.0, 25.0]
assert moving_average([5], 3) == [5.0]
assert moving_average([1, 2, 3, 4], 1) == [1.0, 2.0, 3.0, 4.0]
assert moving_average([4, 8, 2, 6], 4) == [4.0, 6.0, 4.666666666666667, 5.0]
```
