---
concept: 108-disjoint-set-union-find
name: Disjoint Set / Union-Find
---

## Definition

A disjoint set (union-find) structure tracks a collection of
non-overlapping groups, supporting two fast operations — union (merge two
groups) and find (which group does this item belong to) — used to
efficiently answer "are these two things in the same group?" as groups keep
merging.

## Problem

Determining "are these two items already connected?" or "merge these two
groups together" repeatedly, over a large evolving set of groups, is slow
if it requires re-scanning every item's group membership from scratch each
time. Union-Find maintains a structure specifically optimized for exactly
these two operations, both nearly O(1) in practice.

## Execution

Start: each of 1,2,3,4,5 is its own separate group
↓
union(1, 2): merge 1's group and 2's group → find(1) and find(2) now return the SAME representative
↓
union(2, 3): merge 2's group (already containing 1) with 3's group → find(1), find(2), find(3) all now return the same representative
↓
union(4, 5): merge 4 and 5 into a separate group, unrelated to {1,2,3}
↓
find(1) === find(3) → true (same group); find(1) === find(4) → false (different groups)

## Computer Science

Each element points toward a "parent," and repeatedly following parent
pointers reaches a group's representative (root). Two optimizations make
this nearly O(1) amortized per operation: "union by rank/size" (always
attach the smaller tree under the bigger one's root, keeping trees
shallow) and "path compression" (during `find`, point every visited node
directly at the root, flattening the structure for future lookups).

Tags: Union by rank, Path compression, Amortized near-constant time, Representative element

## Software Engineering

This is the standard tool behind Kruskal's minimum spanning tree algorithm
(checking "would adding this edge create a cycle?" is exactly a `find()`
check), detecting cycles in an undirected graph, and tracking dynamic
connectivity as connections keep being added over time.

Tags: Kruskal's algorithm, Cycle detection, Dynamic connectivity

## Common Mistakes

- Implementing `find` without path compression — this still works correctly, but degrades toward O(n) per lookup in the worst case instead of the near-O(1) amortized performance path compression provides.
- Confusing "in the same group" with "directly connected" — union-find only answers group membership (transitively connected through any chain of unions), not whether two specific elements have a direct edge between them.

## Exercises

- Trace by hand what the parent pointers look like after `union(1,2)`, `union(2,3)`, `union(4,5)` — before any path compression happens.
- Add a `union(3, 4)` to the example, merging the two previously-separate groups into one, and confirm `find(1) === find(5)` becomes true.

## javascript

```javascript
class UnionFind {
  #parent = new Map()
  makeSet(x) { this.#parent.set(x, x) }
  find(x) {
    if (this.#parent.get(x) !== x) {
      this.#parent.set(x, this.find(this.#parent.get(x)))   // path compression
    }
    return this.#parent.get(x)
  }
  union(a, b) {
    const rootA = this.find(a), rootB = this.find(b)
    if (rootA !== rootB) this.#parent.set(rootA, rootB)
  }
}

const uf = new UnionFind()
for (const x of [1, 2, 3, 4, 5]) uf.makeSet(x)
uf.union(1, 2)
uf.union(2, 3)
uf.union(4, 5)

console.log(uf.find(1) === uf.find(3))   // true — same group
console.log(uf.find(1) === uf.find(4))   // false — different groups
```
Walkthrough: `union(1,2)` then `union(2,3)` chains 1, 2, and 3 into the
same group, so `find(1)` and `find(3)` both trace back to the same root,
regardless of how many unions happened in between. `find`'s path
compression rewrites each visited node's parent directly to the root
during the lookup, keeping future lookups fast.

## python

```python
class UnionFind:
    def __init__(self):
        self._parent = {}

    def make_set(self, x):
        self._parent[x] = x

    def find(self, x):
        if self._parent[x] != x:
            self._parent[x] = self.find(self._parent[x])   # path compression
        return self._parent[x]

    def union(self, a, b):
        root_a, root_b = self.find(a), self.find(b)
        if root_a != root_b:
            self._parent[root_a] = root_b


uf = UnionFind()
for x in [1, 2, 3, 4, 5]:
    uf.make_set(x)
uf.union(1, 2)
uf.union(2, 3)
uf.union(4, 5)

print(uf.find(1) == uf.find(3))   # True -- same group
print(uf.find(1) == uf.find(4))   # False -- different groups
```
Walkthrough: identical union-and-path-compression mechanics as the
JavaScript version — repeated unions chain elements into the same group,
and `find`'s recursive path compression keeps future lookups fast by
flattening the parent chain as it goes.
