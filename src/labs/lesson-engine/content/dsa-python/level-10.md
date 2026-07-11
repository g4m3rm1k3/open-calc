---
series: dsa-python
level: 10
title: Graphs
lang: python
---

# Graphs

A graph is a set of nodes (vertices) connected by edges. Unlike a tree, a graph has
no root, edges can be bidirectional or directional, and cycles are allowed. Graphs
model networks: roads, friendships, dependencies, web links, and state machines.
Most graph algorithms are traversals — visit every reachable node exactly once —
using either depth-first search (DFS with a stack or recursion) or breadth-first
search (BFS with a queue, covered in Level 4).

## Representing Graphs

The adjacency list is the standard graph representation: a dictionary mapping each
node to its list of neighbours. It is space-efficient (O(V + E) where V is the number
of vertices and E the number of edges) and fast for the operations that matter:
iterating over a node's neighbours.

```python
# Undirected graph — each edge appears in both directions
graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"],
}

# Directed graph — edges are one-way
directed = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["D"],
    "D": [],
}
```

**CS lens:** An adjacency list represents a sparse graph efficiently. The alternative
— an adjacency matrix, a V×V grid where `grid[i][j]` is 1 if an edge exists — uses
O(V²) space regardless of how many edges exist. For a social network with 1 billion
users and 50 billion friendships, the matrix would require 1 exabyte; the adjacency
list requires proportional space.

**SE lens:** The adjacency list is a dict of lists — no custom class needed. This is
a common pattern: represent complex structures using built-in collections instead of
custom objects. The graph "library" is just a `dict` with a known shape.

Depth-first search (DFS) explores as far as possible along each path before
backtracking. Implement it with recursion (using the call stack) or explicitly
with a stack (Level 3). The `visited` set prevents infinite loops in cyclic graphs.

```python
def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    print(node, end=" ")
    for neighbour in graph[node]:
        if neighbour not in visited:
            dfs(graph, neighbour, visited)

graph = {"A": ["B", "C"], "B": ["A", "D"], "C": ["A"], "D": ["B"]}
dfs(graph, "A")   # A B D C  (one valid DFS order — neighbours visited in list order)
```

## Challenge: has path

Given a directed graph as an adjacency list, a start node, and an end node, return
`True` if there is a path from start to end, `False` otherwise. The graph may
contain cycles. Use DFS or BFS — either is correct.

```challenge
def has_path(graph, start, end):
    pass
```

```test
assert has_path({"A": ["B"], "B": ["C"], "C": []}, "A", "C") == True
assert has_path({"A": ["B"], "B": ["C"], "C": []}, "C", "A") == False
assert has_path({"A": ["B", "C"], "B": [], "C": ["D"], "D": []}, "A", "D") == True
assert has_path({"A": ["B"], "B": ["A"], "C": []}, "A", "C") == False
assert has_path({"A": []}, "A", "A") == True
```

## Connected Components

A connected component is a maximal set of nodes where every pair is reachable from
every other. An undirected graph with no isolated nodes has exactly one component.
Counting components is the classic "how many islands" problem generalized to arbitrary
graphs.

The algorithm: iterate over every node. If it has not been visited, start a DFS or BFS
from it — this traversal visits every node in the same component. Increment a counter
and continue. Each traversal from an unvisited node discovers exactly one new component.

```python
def count_components(graph):
    visited = set()
    components = 0

    def dfs(node):
        visited.add(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                dfs(neighbour)

    for node in graph:
        if node not in visited:
            dfs(node)
            components += 1

    return components

g1 = {"A": ["B"], "B": ["A"], "C": ["D"], "D": ["C"], "E": []}
print(count_components(g1))   # 3  (AB, CD, E)

g2 = {"A": ["B", "C"], "B": ["A"], "C": ["A"]}
print(count_components(g2))   # 1  (all connected)
```

**CS lens:** DFS from a single starting node visits every node in the same component —
by definition of reachability. Running DFS once per unvisited node therefore visits
every node exactly once across all calls, giving O(V + E) total — the same as a
single full traversal. Counting calls to the outer DFS counts components.

**SE lens:** The inner `dfs` function captures `visited` from the outer scope. This
is a closure: the inner function accesses variables from the enclosing function without
them being passed as arguments. Using a closure here avoids threading `visited` through
every recursive call as a parameter — the set is shared state across the entire component
discovery, not per-call state.

```python
from collections import deque

def shortest_path_length(graph, start, end):
    # BFS from Level 4 — guaranteed shortest path in terms of edges.
    if start == end:
        return 0
    queue = deque([(start, 0)])
    visited = {start}
    while queue:
        node, distance = queue.popleft()
        for neighbour in graph[node]:
            if neighbour == end:
                return distance + 1
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append((neighbour, distance + 1))
    return -1   # no path

g = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}
print(shortest_path_length(g, "A", "D"))   # 2  (A → B → D or A → C → D)
```

## Challenge: count components

Given an undirected graph as an adjacency list, return the number of connected
components. A node with no edges is its own component. The graph is undirected —
every edge appears in both directions in the adjacency list.

```challenge
def count_components(graph):
    pass
```

```test
assert count_components({"A": ["B"], "B": ["A"], "C": []}) == 2
assert count_components({"A": ["B", "C"], "B": ["A"], "C": ["A"]}) == 1
assert count_components({"A": [], "B": [], "C": []}) == 3
assert count_components({"A": ["B"], "B": ["A", "C"], "C": ["B"], "D": ["E"], "E": ["D"]}) == 2
assert count_components({}) == 0
```
