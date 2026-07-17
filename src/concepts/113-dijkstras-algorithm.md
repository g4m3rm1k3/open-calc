---
concept: 113-dijkstras-algorithm
name: Dijkstra's Algorithm
---

## Definition

Dijkstra's algorithm finds the shortest path from a starting node to every
other node in a weighted graph with non-negative edge weights, by always
expanding outward from whichever unvisited node currently has the smallest
known distance so far.

## Problem

BFS finds the shortest path by number of edges, but doesn't account for
edges having different weights — a path with fewer edges isn't necessarily
cheaper if those edges are expensive. Dijkstra's generalizes shortest-path
search to handle weighted edges correctly.

## Execution

Graph: A-B (weight 4), A-C (weight 1), C-B (weight 1)
↓
Start: distance[A]=0, distance[B]=Infinity, distance[C]=Infinity
↓
Visit A (smallest known distance, 0): update B to 4 (via A), update C to 1 (via A)
↓
Visit C (smallest known unvisited distance, 1): update B to 2 (via C: 1+1=2), better than the previous 4!
↓
Visit B (smallest known unvisited distance, now 2): no more unvisited neighbors to update
↓
Final: distance[A]=0, distance[C]=1, distance[B]=2 — the path A→C→B (cost 2) beats the direct A→B (cost 4)

## Computer Science

Dijkstra's is a greedy algorithm that's provably correct specifically
because of the non-negative-weight assumption — once a node is visited
with its true shortest distance locked in, no later discovery can ever
improve it, since every remaining edge can only ADD non-negative weight,
never subtract. This greedy-choice property breaks entirely if negative
edge weights are allowed.

Tags: Greedy algorithm, Non-negative weights, Priority queue, Shortest path

## Software Engineering

Dijkstra's is implemented efficiently using a min-heap/priority queue to
always pick "the unvisited node with the smallest known distance" quickly,
achieving O((V+E) log V) instead of a naive O(V²) linear scan for the
minimum each time.

Tags: Priority queue implementation, Time complexity, Route planning

## Common Mistakes

- Using Dijkstra's on a graph with NEGATIVE edge weights and expecting correct results — the algorithm's core correctness argument depends entirely on weights never being negative; Bellman-Ford is needed instead when negative weights are possible.
- Implementing the "find the unvisited node with smallest distance" step as a naive linear scan instead of a priority queue — this still produces correct results, just much slower on large graphs.

## Exercises

- Trace Dijkstra's by hand on a 4-node graph with at least one "shortcut" (a longer-looking multi-edge path that's actually cheaper than a direct edge), confirming the algorithm finds the true shortest distances.
- Look up why Dijkstra's fails on a graph with a negative-weight edge, using a small concrete counterexample.

## javascript

```javascript
function dijkstra(graph, start) {
  const distances = {}
  for (const node in graph) distances[node] = Infinity
  distances[start] = 0
  const unvisited = new Set(Object.keys(graph))

  while (unvisited.size > 0) {
    let current = null
    for (const node of unvisited) {
      if (current === null || distances[node] < distances[current]) current = node
    }
    unvisited.delete(current)
    for (const [neighbor, weight] of graph[current]) {
      const newDist = distances[current] + weight
      if (newDist < distances[neighbor]) distances[neighbor] = newDist
    }
  }
  return distances
}

const graph = { A: [['B', 4], ['C', 1]], B: [], C: [['B', 1]] }
console.log(dijkstra(graph, 'A'))   // { A: 0, B: 2, C: 1 } — A→C→B (cost 2) beats direct A→B (cost 4)
```
Walkthrough: each iteration picks the unvisited node with the smallest
known distance so far, then tries to improve its neighbors' distances
through it. Even though `B` is directly reachable from `A` at cost 4, going
through `C` first (cost 1) then to `B` (cost 1 more) totals only 2 —
Dijkstra's correctly finds this cheaper route.

## python

```python
def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    unvisited = set(graph.keys())

    while unvisited:
        current = min(unvisited, key=lambda node: distances[node])
        unvisited.remove(current)
        for neighbor, weight in graph[current]:
            new_dist = distances[current] + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
    return distances


graph = {'A': [('B', 4), ('C', 1)], 'B': [], 'C': [('B', 1)]}
print(dijkstra(graph, 'A'))   # {'A': 0, 'B': 2, 'C': 1} -- A->C->B (cost 2) beats direct A->B (cost 4)
```
Walkthrough: identical greedy-expand-from-smallest-known-distance
mechanics as the JavaScript version — `min(unvisited, key=...)` plays the
role of the priority-queue "pick the smallest" step, and the same cheaper
two-edge route is found over the more expensive direct edge.
