# CPP DSA — LAB-17 — Graphs and Traversal

**Prerequisites:** LAB-16 (Searching Algorithms)

## Quick Check

Before starting, answer these (answers at the bottom):

1. How is a graph more general than LAB-12's binary tree — what restriction does a tree have that a graph doesn't?
2. Why does graph traversal need a "visited" set, when tree traversal (LAB-12) never needed one?
3. What's the one-line difference between a BFS and a DFS implementation, if both are written using an explicit LAB-09/LAB-10 structure instead of recursion?

## What You Will Build

An adjacency-list graph (`MyVector` of `MyLinkedList`s, directly reusing LAB-06 and LAB-07), with both breadth-first search (using LAB-10's `MyQueue`) and depth-first search (using LAB-09's `MyStack`, plus a recursive version) traced step by step, showing exactly why they visit nodes in such different orders on the identical graph.

```
$ ./graph_demo
Graph (adjacency list):
  0: [1, 2]
  1: [0, 3]
  2: [0, 3]
  3: [1, 2, 4]
  4: [3]

BFS from 0: visit 0, visit 1, visit 2, visit 3, visit 4
  (visits ALL neighbors before going deeper -- level by level)

DFS from 0: visit 0, visit 1, visit 3, visit 2, visit 4
  (plunges as DEEP as possible before backtracking)
```

## Concept: Graphs — Trees Without the "No Cycles" Restriction

**What it is:** A graph is a set of nodes (called **vertices**) connected by **edges** — structurally, this is *more general* than LAB-12's binary tree: a tree is really just a graph with two extra restrictions (at most one path between any two nodes, and no cycles — you can never follow edges back to a node you've already visited). A graph has neither restriction: any node can connect to any number of others, and cycles (node 0 connects to node 1, which connects back to node 0) are completely normal and expected.

**The problem before:** LAB-12's tree traversals recursed freely with no fear of infinite loops, precisely *because* a tree structurally cannot contain a cycle — recursing into a child can never lead back to an ancestor. A graph offers no such guarantee: naively adapting LAB-12's recursive traversal to a graph with a cycle (0 → 1 → 0 → 1 → ...) would recurse forever, the exact infinite-recursion danger LAB-11 warned about, except here it's not a missing base case — it's a structural property of the data itself that a tree-shaped algorithm doesn't account for.

**The solution:** Track a **visited set** — every graph traversal, without exception, must remember which nodes it's already processed and refuse to process any of them a second time. This single addition (missing from every tree traversal in LAB-12, because trees never needed it) is what makes graph traversal safe on data containing cycles. **Breadth-first search (BFS)** uses a queue (LAB-10) — visit a node, then enqueue *all* its unvisited neighbors, guaranteeing every node at "distance 1" is visited before any node at "distance 2." **Depth-first search (DFS)** uses a stack (LAB-09) or plain recursion (LAB-11) — visit a node, then immediately plunge into *one* neighbor as deep as possible before ever backtracking to try another.

**Canonical example:**

```cpp
void bfs(MyVector<MyLinkedList<int>>& adjacencyList, int start) {
    MyVector<bool> visited(adjacencyList.getSize(), false);
    MyQueue<int> queue;
    queue.enqueue(start);
    visited[start] = true;

    while (!queue.isEmpty()) {
        int current = queue.dequeue();
        std::cout << "visit " << current << "\n";
        // enqueue every unvisited neighbor of `current`, marking each visited immediately
    }
}
```

**Project Application:** LAB-19's file-backed database, if extended to model relationships between records (which record references which — a real, common file-search scenario), would represent those relationships exactly as this lab's adjacency list, and use BFS/DFS to answer "what's reachable from this record" queries.

**Watch for:** Marking a node "visited" only *after* fully processing it, instead of the moment it's first *discovered* (enqueued/pushed). On a graph with cycles, this timing gap means the same node can be enqueued multiple times before its first processing ever marks it visited — wasted work at best, and on some graph shapes, a bug that lets a node be processed far more times than intended. Always mark visited at discovery time, not at processing time.

## Step 1: The adjacency list — representing a graph with structures you've already built

```cpp
// Graph.h
#ifndef GRAPH_H
#define GRAPH_H

#include "MyVector.h"      // LAB-06
#include "MyLinkedList.h"  // LAB-07

class Graph {
private:
    MyVector<MyLinkedList<int>> adjacencyList; // one MyLinkedList of neighbor indices, per vertex

public:
    Graph(int vertexCount) {
        for (int i = 0; i < vertexCount; i++) {
            adjacencyList.push_back(MyLinkedList<int>());
        }
    }

    void addEdge(int from, int to) {
        adjacencyList[from].push_back(to);
        adjacencyList[to].push_back(from); // undirected: the connection works both ways
    }

    MyLinkedList<int>& getNeighbors(int vertex) {
        return adjacencyList[vertex];
    }

    int getVertexCount() const { return adjacencyList.getSize(); }
};

#endif
```

This is a direct, concrete composition of LAB-06 and LAB-07 into a genuinely new structure, exactly the same pattern LAB-14's hash table used (`MyVector` of `MyLinkedList`s there too) — a vertex's neighbor list is just a `MyLinkedList<int>` of neighbor indices, and the whole graph is a `MyVector` holding one such list per vertex. `addEdge` adding the connection in *both* directions is what makes this an **undirected** graph (if `0` connects to `1`, `1` also connects to `0`) — a **directed** graph, where connections are one-way, would only add `to` to `from`'s list, a distinction worth naming even though this lab builds the undirected version.

### SAVE AND TRY

```cpp
Graph g(5);
g.addEdge(0, 1);
g.addEdge(0, 2);
g.addEdge(1, 3);
g.addEdge(2, 3);
g.addEdge(3, 4);
```

Build the exact graph shown in "What You Will Build," then print each vertex's neighbor list (walking each `MyLinkedList` using LAB-07's `print()` or a similar method) — confirm your printed adjacency list matches the diagram exactly, including that vertex `0`'s list contains both `1` and `2`.

## Step 2: BFS — level by level, using `MyQueue`

```cpp
#include "MyQueue.h" // LAB-10

void bfs(Graph& g, int start) {
    MyVector<bool> visited;
    for (int i = 0; i < g.getVertexCount(); i++) visited.push_back(false);

    MyQueue<int> queue;
    queue.enqueue(start);
    visited[start] = true; // mark visited at DISCOVERY time -- not after processing

    while (!queue.isEmpty()) {
        int current = queue.dequeue();
        std::cout << "visit " << current << "\n";

        MyLinkedList<int>& neighbors = g.getNeighbors(current);
        Node<int>* node = neighbors.getHead(); // from LAB-14's Challenge -- add this accessor if not already present
        while (node != nullptr) {
            int neighbor = node->value;
            if (!visited[neighbor]) {
                visited[neighbor] = true; // mark visited HERE, at discovery
                queue.enqueue(neighbor);
            }
            node = node->next;
        }
    }
}
```

Because `MyQueue` is FIFO (LAB-10), every neighbor discovered from processing `current` gets enqueued *behind* every neighbor already waiting in the queue — which guarantees all of `start`'s direct neighbors get processed before *any* of their neighbors do, and all of those get processed before the next level after that, and so on. This level-by-level guarantee is exactly what "breadth-first" names: explore breadth (everything at the current distance) before depth (anything further away).

### SAVE AND TRY

Run `bfs(g, 0)` on the Step 1 graph and confirm the visit order matches "What You Will Build": `0, 1, 2, 3, 4`. Notice `1` and `2` (both direct neighbors of `0`) are both visited before `3` (a neighbor of both `1` and `2`, but not of `0` directly) — the concrete meaning of "level by level."

## Step 3: DFS — plunging deep first, using `MyStack`

```cpp
#include "MyStack.h" // LAB-09

void dfsIterative(Graph& g, int start) {
    MyVector<bool> visited;
    for (int i = 0; i < g.getVertexCount(); i++) visited.push_back(false);

    MyStack<int> stack;
    stack.push(start);

    while (!stack.isEmpty()) {
        int current = stack.pop();
        if (visited[current]) continue; // may have been pushed multiple times before being processed

        visited[current] = true;
        std::cout << "visit " << current << "\n";

        MyLinkedList<int>& neighbors = g.getNeighbors(current);
        Node<int>* node = neighbors.getHead();
        while (node != nullptr) {
            if (!visited[node->value]) {
                stack.push(node->value);
            }
            node = node->next;
        }
    }
}
```

Notice this version marks `visited` when *popping* (processing), not when pushing — deliberately different from BFS's discovery-time marking, and explicitly guarded with `if (visited[current]) continue;` to handle a node being pushed more than once before its first pop. Compare this whole function against Step 2's `bfs`: the **only structural difference** is `MyStack`/`.pop()` here versus `MyQueue`/`.dequeue()` there — LIFO versus FIFO is the entire, complete explanation for why the exact same graph produces two completely different visit orders.

### SAVE AND TRY

Run `dfsIterative(g, 0)` and compare its output against `bfs(g, 0)`'s from Step 2 — both start at `0`, both eventually visit every reachable vertex, but in a different order. Trace by hand why DFS here visits `3` immediately after `1` (rather than visiting `2` first, as BFS did): `1` gets pushed, then popped and processed, and *its* unvisited neighbor `3` gets pushed and is the very next thing popped — DFS commits to going deep through `1` before ever coming back to try `0`'s other neighbor `2`.

## Step 4: DFS — the recursive version, and why it's often more natural

```cpp
void dfsRecursiveHelper(Graph& g, int current, MyVector<bool>& visited) {
    visited[current] = true;
    std::cout << "visit " << current << "\n";

    MyLinkedList<int>& neighbors = g.getNeighbors(current);
    Node<int>* node = neighbors.getHead();
    while (node != nullptr) {
        if (!visited[node->value]) {
            dfsRecursiveHelper(g, node->value, visited); // recurse -- THIS call is what plunges deeper
        }
        node = node->next;
    }
}

void dfsRecursive(Graph& g, int start) {
    MyVector<bool> visited;
    for (int i = 0; i < g.getVertexCount(); i++) visited.push_back(false);
    dfsRecursiveHelper(g, start, visited);
}
```

This is LAB-11's lesson made completely explicit: the recursive call stack *is* the explicit `MyStack` from Step 3, just managed automatically by the language instead of by hand — every recursive call to `dfsRecursiveHelper` pushes a real stack frame, and returning from it is exactly analogous to popping. The visit order this produces should match Step 3's iterative version exactly (modulo which neighbor gets tried first, if a vertex has multiple unvisited neighbors) — direct proof that "DFS with an explicit stack" and "DFS via plain recursion" really are the same algorithm, expressed two different ways.

### SAVE AND TRY

Run `dfsRecursive(g, 0)` and confirm its output matches `dfsIterative(g, 0)`'s from Step 3. Then deliberately construct a graph with a genuine cycle (e.g., `g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 0);` — a triangle) and run both DFS versions on it — confirm neither one infinite-loops, direct proof the `visited` array is correctly preventing the exact infinite-recursion danger this lab's concept section named as the whole reason graph traversal needs it in the first place.

## 🎯 Challenge

Write `bool hasPath(Graph& g, int start, int end)` using BFS (or DFS — either works) to determine whether `end` is reachable from `start` at all, without needing to print or process every reachable node if the target is found early.

<details>
<summary>Solution</summary>

```cpp
bool hasPath(Graph& g, int start, int end) {
    if (start == end) return true;

    MyVector<bool> visited;
    for (int i = 0; i < g.getVertexCount(); i++) visited.push_back(false);

    MyQueue<int> queue;
    queue.enqueue(start);
    visited[start] = true;

    while (!queue.isEmpty()) {
        int current = queue.dequeue();

        MyLinkedList<int>& neighbors = g.getNeighbors(current);
        Node<int>* node = neighbors.getHead();
        while (node != nullptr) {
            if (node->value == end) return true; // found it -- exit immediately, no need to finish traversal
            if (!visited[node->value]) {
                visited[node->value] = true;
                queue.enqueue(node->value);
            }
            node = node->next;
        }
    }
    return false; // exhausted every reachable vertex, end was never among them
}
```

The early `return true;` the moment `end` is discovered (rather than waiting to dequeue and "visit" it formally) is a small but real optimization — this function only cares about reachability, not about visiting every node in a particular order, so there's no reason to wait for the full traversal to complete once the answer is already known.

</details>

## Mental Model

| Concept | Tree traversal (LAB-12) | Graph traversal (this lab) |
|---|---|---|
| Cycles possible? | Never — structurally impossible | Yes — completely normal |
| Needs a `visited` set? | No | Always — required for correctness, not optional |
| BFS vs DFS | N/A — trees usually use pre/in/post-order instead | BFS = queue (LAB-10), DFS = stack (LAB-09) or recursion (LAB-11) |
| Visit order guarantee | Fixed by the traversal type (in/pre/post) | BFS: level-by-level; DFS: as deep as possible first |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why can a tree traversal safely recurse with no visited set, while a graph traversal cannot? | |
| 2 | Why does BFS visit all of a node's direct neighbors before any node two steps away? | |
| 3 | What would happen if `dfsIterative`'s `visited[current] = true;` line were moved to right after `stack.push(start);` (marking at push-time) instead of after popping? | |

## Quick Check Answers

1. A tree requires exactly one path between any two nodes and forbids cycles entirely (LAB-12's node with two children, each itself a smaller tree, structurally cannot loop back on itself); a graph has neither restriction — any node can connect to any number of others, and following edges can absolutely lead back to an already-visited node.
2. Trees never contain cycles, so recursing into a child can never lead back to an ancestor or any other already-visited node — there's no possibility of infinite recursion to guard against; a graph's cycles mean that without tracking what's already been processed, a traversal could revisit the same nodes forever, never terminating.
3. Because a queue (FIFO) always processes everything already waiting before anything added later — every neighbor of the start node gets enqueued and is guaranteed to be dequeued before any of *their* neighbors (added afterward) get a turn, which is precisely the level-by-level guarantee "breadth-first" describes.

*Next: [LAB-18 — File I/O Fundamentals](CPP-S02-LAB-18-FILE-IO-FUNDAMENTALS.md)*
