# FOUNDATIONS — LAB-030 — Graphs

**Series:** FOUNDATIONS — Part V: Data Structures
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 60–75 minutes.

---

## What You Will Build

A graph represented as an adjacency list, depth-first search (DFS) to find any path between two nodes, breadth-first search (BFS) to find the shortest path (by edge count), and a cycle detector. After this lab you will be able to identify which real-world problems are graph problems and choose DFS vs BFS based on what the problem requires.

---

## What You Need to Know First

**From LAB-029 (Trees):** A tree is a special graph — connected, directed (parent → child), and with no cycles. Everything you know about tree traversal applies to graphs with one addition: graphs can have cycles, so traversal must track visited nodes.

**From LAB-027 (Stacks and Queues):** DFS uses a stack (or the call stack via recursion). BFS uses a queue. The data structure you use to store the "next nodes to visit" determines the traversal order.

**From LAB-025 (Hash Tables):** The visited set uses a hash set for O(1) membership testing — has this node been visited already?

---

> **Quick Check — try to answer before reading:**
>
> 1. A tree with n nodes has exactly n−1 edges. Why?
> 2. What makes a graph different from a tree?
> 3. Why must graph traversal track visited nodes, while tree traversal does not?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Graph Vocabulary

**Vertices (nodes)** are the things being modelled. **Edges** are the relationships between them.

A **directed graph** (digraph) has edges with a direction — an edge from A to B does not imply an edge from B to A. A social media "follow" relationship is directed.

An **undirected graph** has edges with no direction — if A is connected to B, B is connected to A. A road network is undirected (you can drive either way).

A **weighted graph** assigns a cost (distance, time, price) to each edge. An **unweighted graph** treats all edges as equal.

A **cycle** is a path that starts and ends at the same vertex. Trees have no cycles. Graphs may.

A **connected** graph has a path between every pair of vertices. A **disconnected** graph has vertices with no path between them.

---

### Step 2 — Adjacency List Representation

**The problem this step solves:** Store a graph in memory. The two main representations are the adjacency matrix (an n×n boolean matrix) and the adjacency list (a map from each vertex to its neighbor list). Adjacency lists use O(V + E) space — proportional to vertices plus edges. Adjacency matrices use O(V²) — regardless of how many edges exist.

For sparse graphs (few edges relative to vertices), adjacency lists are far more space-efficient. Most real-world graphs — road networks, social networks, dependency trees — are sparse.

**The code:**

```js
class Graph {
  #adjacencyList = new Map();   // vertex → [neighbor, neighbor, ...]

  addVertex(vertex) {
    if (!this.#adjacencyList.has(vertex)) {
      this.#adjacencyList.set(vertex, []);
    }
    return this;
  }

  addEdge(vertexA, vertexB) {
    // Undirected: add both directions
    this.#adjacencyList.get(vertexA).push(vertexB);
    this.#adjacencyList.get(vertexB).push(vertexA);
    return this;
  }

  addDirectedEdge(from, to) {
    this.#adjacencyList.get(from).push(to);
    return this;
  }

  neighbors(vertex) {
    return this.#adjacencyList.get(vertex) ?? [];
  }

  get vertices() {
    return [...this.#adjacencyList.keys()];
  }
}
```

**The walkthrough:**

```js
const cityGraph = new Graph();
['London', 'Paris', 'Berlin', 'Rome', 'Madrid'].forEach(city => cityGraph.addVertex(city));
cityGraph.addEdge('London', 'Paris');
cityGraph.addEdge('Paris', 'Berlin');
cityGraph.addEdge('Paris', 'Rome');
cityGraph.addEdge('Berlin', 'Rome');
cityGraph.addEdge('Rome', 'Madrid');

cityGraph.neighbors('Paris');  // ['London', 'Berlin', 'Rome']
```

Internal state: `Map { 'London' → ['Paris'], 'Paris' → ['London', 'Berlin', 'Rome'], 'Berlin' → ['Paris', 'Rome'], ... }`.

**The CS lens — adjacency list:** The Map gives O(1) lookup by vertex name (hash table). Each vertex's neighbor array gives O(degree) — proportional to how many edges that vertex has. For most real graphs, degree is much smaller than the total vertex count.

**The SE lens — data decision:** We use `Map` instead of a plain object because vertex names might not be valid JavaScript property names (they could be numbers, objects, or strings with special characters). `Map` accepts any value as a key. This is the habit of choosing the right data structure for the actual data.

---

### Step 3 — Depth-First Search

**The problem this step solves:** Find any path from a start vertex to a target vertex, or determine that none exists.

DFS explores as deep as possible along each branch before backtracking. It uses a stack: push the start node, then repeatedly pop a node, check if it is the target, and push its unvisited neighbors.

**The code:**

```js
// Add to Graph:
depthFirstSearch(startVertex, targetVertex) {
  const visitedVertices = new Set();
  const stack = [startVertex];

  while (stack.length > 0) {
    const currentVertex = stack.pop();            // LIFO — go deep

    if (currentVertex === targetVertex) return true;

    if (!visitedVertices.has(currentVertex)) {
      visitedVertices.add(currentVertex);
      for (const neighbor of this.neighbors(currentVertex)) {
        if (!visitedVertices.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return false;   // target not reachable
}
```

**The walkthrough — DFS from London to Madrid:**

Initial stack: `['London']`. Visited: `{}`.

Pop `London`. Not target. Mark visited. Push neighbors: `['Paris']` (London's only neighbor).
Stack: `['Paris']`.

Pop `Paris`. Not target. Mark visited. Push unvisited neighbors: Berlin, Rome (London already visited).
Stack: `['Berlin', 'Rome']`.

Pop `Rome`. Not target. Mark visited. Push unvisited neighbors: Berlin (Paris visited), Madrid.
Stack: `['Berlin', 'Madrid']`.

Pop `Madrid`. **Target found!** Return `true`.

The path found depends on neighbor order and the LIFO order of the stack. DFS does not guarantee the shortest path.

**The CS lens — visited set:** Without the visited set, the algorithm loops forever on cycles. The visited set is an invariant: "once a vertex is added to visited, we never process it again." In a tree (no cycles), this is unnecessary — you can never reach the same node twice. In a graph, you can.

**The SE lens — explicit stack vs call stack:** This DFS uses an explicit stack (an array). An alternative is recursive DFS, which uses the call stack implicitly. For very deep graphs, recursive DFS risks stack overflow (LAB-001). The explicit stack moves that problem from the call stack (fixed size) to the heap (unbounded), making it safer for large graphs.

---

### Step 4 — Breadth-First Search and Shortest Path

**The problem this step solves:** Find the shortest path (fewest edges) from a start vertex to a target vertex.

BFS explores all neighbors at the current depth before going deeper. It uses a queue: enqueue the start node, then repeatedly dequeue a node, check if it is the target, and enqueue its unvisited neighbors.

**The code:**

```js
// Add to Graph:
breadthFirstSearch(startVertex, targetVertex) {
  if (startVertex === targetVertex) return [startVertex];

  const visitedVertices = new Set([startVertex]);
  const queue = [[startVertex]];         // queue of paths, not just vertices

  while (queue.length > 0) {
    const currentPath = queue.shift();   // FIFO — dequeue from front
    const currentVertex = currentPath[currentPath.length - 1];

    for (const neighbor of this.neighbors(currentVertex)) {
      if (!visitedVertices.has(neighbor)) {
        const newPath = [...currentPath, neighbor];

        if (neighbor === targetVertex) return newPath;   // shortest path found

        visitedVertices.add(neighbor);
        queue.push(newPath);
      }
    }
  }

  return null;   // no path exists
}
```

**The walkthrough — BFS from London to Madrid:**

Queue: `[['London']]`. Visited: `{London}`.

Dequeue `['London']`. Current: London. Neighbors: Paris (unvisited).
- `newPath = ['London', 'Paris']`. Not target. Add Paris to visited. Enqueue.

Queue: `[['London', 'Paris']]`.

Dequeue `['London', 'Paris']`. Current: Paris. Neighbors: London (visited), Berlin (unvisited), Rome (unvisited).
- `['London', 'Paris', 'Berlin']` → enqueue.
- `['London', 'Paris', 'Rome']` → enqueue.

Queue: `[['London', 'Paris', 'Berlin'], ['London', 'Paris', 'Rome']]`.

Dequeue `['London', 'Paris', 'Berlin']`. Current: Berlin. Neighbors: Paris (visited), Rome (will be visited).
- `['London', 'Paris', 'Berlin', 'Rome']` → Rome is unvisited, enqueue.

Dequeue `['London', 'Paris', 'Rome']`. Current: Rome. Neighbors: Paris (visited), Berlin (visited), Madrid (unvisited).
- `newPath = ['London', 'Paris', 'Rome', 'Madrid']`. **Target!** Return `['London', 'Paris', 'Rome', 'Madrid']`.

This is the shortest path by edge count: 3 edges. ✓

**The CS lens — queue produces shortest path:** BFS visits all nodes at distance 1, then all at distance 2, and so on. The first time the target is reached, it was reached by the fewest edges — because any shorter path would have been explored in a previous BFS layer.

**The SE lens — path stored with each queue entry:** Instead of storing just the vertex, we store the full path from start to current vertex. This uses more memory but produces the path automatically. The tradeoff is O(n²) path storage in the worst case, acceptable for finding one path; for finding all shortest paths, a parent-pointer approach is more efficient.

---

### Step 5 — Cycle Detection

**The problem this step solves:** Detect whether a graph contains a cycle. This is essential for dependency graphs — a cycle in dependencies means there is no valid build order.

**The code:**

```js
// Add to Graph — for undirected graphs:
hasCycle() {
  const visitedVertices = new Set();

  const dfsDetect = (currentVertex, parentVertex) => {
    visitedVertices.add(currentVertex);
    for (const neighbor of this.neighbors(currentVertex)) {
      if (!visitedVertices.has(neighbor)) {
        if (dfsDetect(neighbor, currentVertex)) return true;
      } else if (neighbor !== parentVertex) {
        // Visited neighbor that is not our parent → cycle found
        return true;
      }
    }
    return false;
  };

  for (const vertex of this.vertices) {
    if (!visitedVertices.has(vertex)) {
      if (dfsDetect(vertex, null)) return true;
    }
  }
  return false;
}
```

**The walkthrough:** For an undirected graph `A–B–C–A` (a triangle):

DFS from A (parent=null). Mark A visited. Neighbor B.
  DFS from B (parent=A). Mark B visited. Neighbor A (visited, but A is parent — skip). Neighbor C.
    DFS from C (parent=B). Mark C visited. Neighbor A (visited, A ≠ B = parent) → **cycle found**.

**The CS lens — parent tracking:** In an undirected graph, every edge appears in both directions. When we visit B from A, B will see A as a neighbor. Without tracking the parent, we would detect the edge A–B as a back-edge (cycle) even though it is not. The parent check skips the edge we just came from.

**Try it:**

```js
const graph = new Graph();
['A', 'B', 'C', 'D', 'E'].forEach(v => graph.addVertex(v));
graph.addEdge('A', 'B').addEdge('B', 'C').addEdge('C', 'D').addEdge('D', 'E');

console.log(graph.depthFirstSearch('A', 'E'));   // true
console.log(graph.breadthFirstSearch('A', 'E')); // ['A', 'B', 'C', 'D', 'E']
console.log(graph.hasCycle());                   // false

graph.addEdge('E', 'A');   // add cycle
console.log(graph.hasCycle());                   // true
```

---

## Connect the Pieces

- **Git** models history as a directed acyclic graph (DAG) — each commit points to its parent(s). `git log` is a DFS traversal. Branch merges create a node with two parents.
- **npm dependency resolution** builds a dependency graph and performs topological sort (LAB-135) — impossible if the graph has a cycle.
- **React's component tree** is a tree (a graph with no cycles) — that is why React's reconciliation can be a tree traversal without visited-set tracking.
- **Google's PageRank** runs on the directed graph of web links. The algorithm is a random walk on this graph, assigning importance to nodes based on how many other important nodes link to them.
- **Dijkstra's shortest path** (LAB-135) extends BFS to weighted graphs — you want the path with minimum total weight, not minimum edge count.

---

## What Breaks Without This

**Forgetting the visited set:**

```js
// BUG: no visited tracking
depthFirstSearch(start, target) {
  const stack = [start];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === target) return true;
    for (const neighbor of this.neighbors(current)) {
      stack.push(neighbor);   // push every neighbor including already-visited
    }
  }
  return false;
}
```

On any graph with a cycle, this runs forever — the stack keeps growing as the algorithm cycles between the same two nodes. In a browser, it will eventually exhaust memory and crash the tab.

---

## Definition of Done

- [ ] `addVertex` and `addEdge` build the correct adjacency list (verify with `neighbors()`)
- [ ] `depthFirstSearch('London', 'Madrid')` returns `true`
- [ ] `breadthFirstSearch('London', 'Madrid')` returns a path of length 4
- [ ] `hasCycle()` returns `false` for a tree, `true` after adding a back-edge
- [ ] You can explain why BFS finds the shortest path and DFS does not

**Git commit:**

```
git add src/
git commit -m "LAB-030: graph with DFS, BFS shortest path, and cycle detection — visited set prevents infinite loops; queue vs stack explains BFS vs DFS"
```

---

## Quick Check Answers

1. **n−1 edges.** Each of the n−1 non-root nodes has exactly one parent edge. The root has no parent edge. No cycles means no edge is redundant. Add one edge and you create a cycle.
2. **Cycles and multiple edges.** A graph can have cycles (a path from a node back to itself) and can have edges that skip levels — or even edges that go "sideways" between nodes at the same level. A tree is a graph with no cycles and exactly one path between any two nodes.
3. **Because graphs have cycles.** In a tree, every node has exactly one parent, so DFS/BFS can never reach the same node twice. In a graph, multiple paths can lead to the same node. Without a visited set, traversal would follow those paths repeatedly forever.
