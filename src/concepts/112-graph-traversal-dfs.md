---
concept: 112-graph-traversal-dfs
name: Graph Traversal (DFS vs BFS)
---

## Definition

Depth-first search (DFS) explores a graph by going as deep as possible
along one path before backtracking, in contrast to breadth-first search
(BFS), which explores level by level, visiting everything at the current
distance before moving farther out.

## Problem

Different graph questions need different exploration orders — "is there
any path at all" or "does a cycle exist" is naturally answered by diving
deep along one path (DFS), while "what's the shortest path" needs to
explore level by level to guarantee the first time a target is reached is
via the shortest route (BFS, see the Graph concept).

## Execution

Graph: A connects to B and C; B connects to D
↓
DFS from A: visit A, go deep into its first neighbor B immediately
↓
From B: go deep into ITS first unvisited neighbor D immediately
↓
D has no unvisited neighbors — backtrack to B, no more unvisited neighbors — backtrack to A
↓
From A: visit remaining unvisited neighbor C
↓
Visited order: A, B, D, C — notice this dives deep (A → B → D) before
ever revisiting A's other neighbor C

## Computer Science

DFS is naturally expressed either recursively (the call stack itself
tracks "how to backtrack") or iteratively with an explicit stack — contrast
this with BFS's explicit queue. The choice of stack vs. queue for the "next
node to visit" is the entire difference between the two traversal orders.

Tags: Stack-based traversal, Recursion, Cycle detection, Topological ordering

## Software Engineering

DFS is the natural fit for cycle detection, topological sorting, and
exploring a maze or puzzle space where any valid path will do. BFS is the
natural fit whenever the fewest steps or shortest path specifically
matters, since BFS's level-by-level order guarantees the first time a
target is reached, it's via the shortest route.

Tags: Cycle detection, Topological sort, Shortest path, Maze solving

## Common Mistakes

- Using DFS when the shortest path specifically matters — DFS finds a path, but has no guarantee it's the shortest one; BFS is needed for that guarantee.
- Forgetting to track visited nodes in DFS just as much as in BFS — a graph with a cycle causes infinite recursion or looping without it, regardless of which traversal order is used.

## Exercises

- Trace DFS by hand on a small graph with a cycle, and confirm that tracking visited nodes prevents infinite recursion.
- Run BOTH BFS and DFS on the same graph starting from the same node, and compare the visiting order each produces.

## javascript

```javascript
const graph = { A: ['B', 'C'], B: ['D'], C: [], D: [] }

function dfs(graph, start, visited = new Set(), order = []) {
  visited.add(start)
  order.push(start)
  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited, order)
  }
  return order
}

console.log(dfs(graph, 'A'))   // [ 'A', 'B', 'D', 'C' ]
```
Walkthrough: DFS visits `A`, then immediately dives into its first
neighbor `B`, then immediately dives into `B`'s first neighbor `D`, before
ever coming back to check `A`'s other neighbor `C` — the recursive call
itself is what "goes deep first," with the call stack implicitly tracking
how to backtrack once a path is exhausted.

## python

```python
graph = {'A': ['B', 'C'], 'B': ['D'], 'C': [], 'D': []}


def dfs(graph, start, visited=None, order=None):
    if visited is None:
        visited = set()
    if order is None:
        order = []
    visited.add(start)
    order.append(start)
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited, order)
    return order


print(dfs(graph, 'A'))   # ['A', 'B', 'D', 'C']
```
Walkthrough: identical deep-first-then-backtrack mechanics as the
JavaScript version — the recursive call structure itself produces the
depth-first order, contrasting directly with BFS's explicit queue-based
level-by-level order.
