---
concept: 107-graph
name: Graph
---

## Definition

A graph is a set of nodes (vertices) connected by edges, representing
relationships or connections between things — more general than a tree,
since a graph allows cycles and doesn't require a single root or a strict
parent-child hierarchy.

## Problem

Some relationships aren't hierarchical — a social network of mutual
friendships, a road map, a dependency graph where packages depend on each
other, sometimes circularly. Trees can't represent cycles or multiple paths
between the same two nodes; graphs can represent both directly.

## Execution

Represent a graph as an adjacency list: {A: [B, C], B: [A, D], C: [A], D: [B]}
↓
Start a BFS from A: visit A, queue up its neighbors [B, C]
↓
Visit B (queued next): queue up B's unvisited neighbors [D] (A already visited, skip)
↓
Visit C: no new unvisited neighbors
↓
Visit D: no new unvisited neighbors
↓
Visited order: A, B, C, D — every node reachable from A, visited in order of distance

## Computer Science

A graph can be directed (edges have a direction, A→B doesn't imply B→A) or
undirected (edges go both ways), and weighted (edges carry a cost or
distance) or unweighted. This is a strict generalization of a tree (a tree
is just a graph with no cycles and exactly one path between any two nodes)
and of a linked list (a graph where every node has at most one outgoing
edge).

Tags: Vertices and edges, Directed vs undirected, Weighted vs unweighted, Adjacency list/matrix

## Software Engineering

The two standard representations are an adjacency LIST (each node stores a
list of its neighbors — memory-efficient for sparse graphs, most
real-world graphs) and an adjacency MATRIX (an NxN table of 0/1 or weights
— simpler to reason about, but wastes memory on sparse graphs with far
fewer than N² actual edges).

Tags: Adjacency list, Adjacency matrix, Sparse vs dense graphs

## Common Mistakes

- Forgetting to track visited nodes during traversal — without it, a graph WITH a cycle causes infinite looping, unlike a tree where this mistake wouldn't even be visible.
- Assuming an edge is automatically bidirectional in a directed graph — A having an edge to B doesn't mean B has an edge back to A unless that reverse edge was explicitly added too.

## Exercises

- Add a cycle to the example graph (an edge from D back to A) and confirm the BFS still terminates correctly once visited-tracking is in place.
- Implement the same traversal as DFS (using a stack, or recursion) instead of BFS, and compare the visiting order.

## javascript

```javascript
const graph = { A: ['B', 'C'], B: ['A', 'D'], C: ['A'], D: ['B'] }

function bfs(graph, start) {
  const visited = new Set([start])
  const queue = [start]
  const order = []
  while (queue.length > 0) {
    const node = queue.shift()
    order.push(node)
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }
  return order
}

console.log(bfs(graph, 'A'))   // [ 'A', 'B', 'C', 'D' ]
```
Walkthrough: `visited` prevents revisiting a node — essential once cycles
are possible, unlike a tree — and the `queue` ensures nodes are processed
in order of distance from the start — everything reachable in 1 step (`B`,
`C`) is visited before anything reachable in 2 steps (`D`).

## python

```python
from collections import deque

graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}


def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order


print(bfs(graph, 'A'))   # ['A', 'B', 'C', 'D']
```
Walkthrough: identical visited-set-plus-queue mechanics as the JavaScript
version — `deque` gives efficient FIFO removal from the front, matching
the Queue concept's O(1) dequeue exactly.
