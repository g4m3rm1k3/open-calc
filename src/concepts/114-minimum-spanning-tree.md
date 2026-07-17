---
concept: 114-minimum-spanning-tree
name: Minimum Spanning Tree
---

## Definition

A minimum spanning tree (MST) connects every node in a weighted graph using
the smallest possible total edge weight, with no cycles — exactly enough
edges (N-1 for N nodes) to keep everything connected, at the lowest total
cost.

## Problem

Connecting N locations with the cheapest possible total cost, while still
reaching every location, requires choosing which edges to include out of
all the possible connections — naively trying every possible subset of
edges is exponential. Algorithms like Kruskal's exploit the problem's
structure to find the true minimum efficiently.

## Execution

Graph edges (with weights): A-B(1), B-C(2), A-C(3)
↓
Kruskal's: sort ALL edges by weight ascending: A-B(1), B-C(2), A-C(3)
↓
Take A-B(1): connects A and B, no cycle — add it to the MST
↓
Take B-C(2): connects B and C (new node), no cycle — add it to the MST
↓
Take A-C(3): A and C are ALREADY connected (via A-B-C) — adding this would
create a cycle — SKIP it
↓
MST = {A-B, B-C}, total weight 3 — every node connected, minimum possible
cost, no cycles

## Computer Science

Kruskal's algorithm is greedy — it always considers the cheapest remaining
edge next, adding it unless doing so would create a cycle. Checking "would
this edge create a cycle" efficiently is exactly what Union-Find is built
for — two endpoints already in the same set means a cycle would form.

Tags: Kruskal's algorithm, Greedy algorithm, Union-Find, Cycle avoidance

## Software Engineering

MST algorithms are the standard tool for network design problems —
minimizing cable, pipe, or road length while keeping everything connected.
Kruskal's (sort edges, use Union-Find) and Prim's (grow one connected tree
outward, always adding the cheapest edge that extends it) are the two
standard approaches, differing mainly in whether they think edge-first
(Kruskal's) or node-first (Prim's).

Tags: Network design, Kruskal's vs Prim's, Infrastructure planning

## Common Mistakes

- Forgetting to check for cycles when adding edges — without that check, the result isn't a tree at all, and may not even be minimal.
- Assuming an MST is unique — if multiple edges share the same weight, more than one valid MST, all with the same total minimum weight, can exist for the same graph.

## Exercises

- Add a 4th node D connected to C with weight 1, and re-run Kruskal's by hand to find the new MST.
- Trace through why adding A-C(3) in the example would create a cycle, using the Union-Find `find()` operation explicitly.

## javascript

```javascript
class UnionFind {
  #parent = new Map()
  makeSet(x) { this.#parent.set(x, x) }
  find(x) {
    if (this.#parent.get(x) !== x) this.#parent.set(x, this.find(this.#parent.get(x)))
    return this.#parent.get(x)
  }
  union(a, b) {
    const rootA = this.find(a), rootB = this.find(b)
    if (rootA === rootB) return false   // already connected — would create a cycle
    this.#parent.set(rootA, rootB)
    return true
  }
}

function kruskal(nodes, edges) {
  const uf = new UnionFind()
  for (const node of nodes) uf.makeSet(node)
  const sorted = [...edges].sort((a, b) => a[2] - b[2])
  const mst = []
  for (const [u, v, weight] of sorted) {
    if (uf.union(u, v)) mst.push([u, v, weight])   // only add if it doesn't create a cycle
  }
  return mst
}

const edges = [['A', 'B', 1], ['B', 'C', 2], ['A', 'C', 3]]
console.log(kruskal(['A', 'B', 'C'], edges))
// [ [ 'A', 'B', 1 ], [ 'B', 'C', 2 ] ] — total weight 3
```
Walkthrough: edges are tried in ascending weight order. `A-B` and `B-C`
each connect a previously-unconnected node, so `union` succeeds and they're
added. `A-C` is tried last — but `A` and `C` are already connected via
`A-B-C`, so `union` returns `false` (would create a cycle) and it's
correctly skipped.

## python

```python
class UnionFind:
    def __init__(self):
        self._parent = {}

    def make_set(self, x):
        self._parent[x] = x

    def find(self, x):
        if self._parent[x] != x:
            self._parent[x] = self.find(self._parent[x])
        return self._parent[x]

    def union(self, a, b):
        root_a, root_b = self.find(a), self.find(b)
        if root_a == root_b:
            return False   # already connected -- would create a cycle
        self._parent[root_a] = root_b
        return True


def kruskal(nodes, edges):
    uf = UnionFind()
    for node in nodes:
        uf.make_set(node)
    sorted_edges = sorted(edges, key=lambda e: e[2])
    mst = []
    for u, v, weight in sorted_edges:
        if uf.union(u, v):   # only add if it doesn't create a cycle
            mst.append((u, v, weight))
    return mst


edges = [('A', 'B', 1), ('B', 'C', 2), ('A', 'C', 3)]
print(kruskal(['A', 'B', 'C'], edges))
# [('A', 'B', 1), ('B', 'C', 2)] -- total weight 3
```
Walkthrough: identical greedy-plus-cycle-check mechanics as the JavaScript
version — edges are considered cheapest-first, and Union-Find's `union`
return value directly tells the algorithm whether adding an edge is safe.
