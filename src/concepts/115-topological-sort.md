---
concept: 115-topological-sort
name: Topological Sort
---

## Definition

A topological sort orders the nodes of a directed acyclic graph (DAG) so
that every edge points from an earlier node to a later one in the
ordering — used whenever some tasks must happen before others, and the
overall valid order needs to be determined.

## Problem

A set of tasks with dependencies (compile file B before file A, since A
imports B; take a prerequisite course before its follow-up) needs to be
executed in some order that respects every dependency — topological sort
finds such a valid order, or detects that no valid order exists at all if
there's a circular dependency.

## Execution

Dependencies (edge A→B means "A must come before B"): Shirt→Jacket, Underwear→Pants, Pants→Jacket
↓
Find a node with NO remaining incoming edges: Shirt and Underwear both qualify
↓
Output Shirt, remove its outgoing edge (Shirt→Jacket) — Jacket now has one fewer incoming edge
↓
Output Underwear, remove its outgoing edge (Underwear→Pants) — Pants now has zero incoming edges
↓
Output Pants, remove its outgoing edge (Pants→Jacket) — Jacket now has zero incoming edges
↓
Output Jacket — valid order: Shirt, Underwear, Pants, Jacket

## Computer Science

This specific algorithm — repeatedly removing nodes with no remaining
incoming edges — is called Kahn's algorithm. It works because a DAG is
guaranteed to always have at least one node with zero incoming edges at
every step; if it didn't, that would imply a cycle exists, contradicting
"acyclic." If the algorithm ever gets stuck with remaining nodes but none
having zero incoming edges, that's definitive proof the graph actually
contains a cycle.

Tags: Kahn's algorithm, Directed acyclic graph, Cycle detection, Dependency resolution

## Software Engineering

This is the standard technique behind build systems (compiling files in
dependency order), package managers (installing dependencies before the
packages that need them), and task schedulers with prerequisites.

Tags: Build systems, Package managers, Dependency resolution, Task scheduling

## Common Mistakes

- Assuming a topological sort is unique — multiple valid orderings often exist; "a" valid order, not "the" valid order, is what's being found.
- Not detecting a cycle — if the graph has a circular dependency, no valid topological order exists at all, and an algorithm that doesn't check for this can loop forever or silently return an incomplete result.

## Exercises

- Add a dependency Jacket→Shirt to the example (creating a cycle) and confirm the algorithm correctly detects that no valid order exists.
- Find a different valid topological order for the original example besides the one shown.

## javascript

```javascript
function topologicalSort(nodes, edges) {
  const inDegree = Object.fromEntries(nodes.map(n => [n, 0]))
  const adjacency = Object.fromEntries(nodes.map(n => [n, []]))
  for (const [from, to] of edges) {
    adjacency[from].push(to)
    inDegree[to]++
  }

  const queue = nodes.filter(n => inDegree[n] === 0)
  const order = []
  while (queue.length > 0) {
    const node = queue.shift()
    order.push(node)
    for (const next of adjacency[node]) {
      inDegree[next]--
      if (inDegree[next] === 0) queue.push(next)
    }
  }
  return order.length === nodes.length ? order : null   // null — a cycle exists
}

const nodes = ['Shirt', 'Underwear', 'Pants', 'Jacket']
const edges = [['Shirt', 'Jacket'], ['Underwear', 'Pants'], ['Pants', 'Jacket']]
console.log(topologicalSort(nodes, edges))
// [ 'Shirt', 'Underwear', 'Pants', 'Jacket' ]
```
Walkthrough: nodes with zero remaining incoming edges start in the queue.
Processing a node "removes" its outgoing edges by decrementing each
neighbor's incoming-edge count, and any neighbor that reaches zero joins
the queue next. If the final order doesn't include every node, a cycle
prevented some nodes from ever reaching zero incoming edges.

## python

```python
def topological_sort(nodes, edges):
    in_degree = {n: 0 for n in nodes}
    adjacency = {n: [] for n in nodes}
    for frm, to in edges:
        adjacency[frm].append(to)
        in_degree[to] += 1

    queue = [n for n in nodes if in_degree[n] == 0]
    order = []
    while queue:
        node = queue.pop(0)
        order.append(node)
        for next_node in adjacency[node]:
            in_degree[next_node] -= 1
            if in_degree[next_node] == 0:
                queue.append(next_node)
    return order if len(order) == len(nodes) else None   # None -- a cycle exists


nodes = ['Shirt', 'Underwear', 'Pants', 'Jacket']
edges = [('Shirt', 'Jacket'), ('Underwear', 'Pants'), ('Pants', 'Jacket')]
print(topological_sort(nodes, edges))
# ['Shirt', 'Underwear', 'Pants', 'Jacket']
```
Walkthrough: identical Kahn's-algorithm mechanics as the JavaScript version
— nodes join the queue once their incoming-edge count reaches zero, and
processing a node propagates that decrement to its neighbors.
