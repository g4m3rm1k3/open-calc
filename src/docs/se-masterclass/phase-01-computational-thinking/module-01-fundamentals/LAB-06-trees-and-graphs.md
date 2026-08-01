# SE Masterclass — LAB-06 — Trees and Graphs

**Language: C++** *(continuing from LAB-05)*
*Why C++ still:* Trees and graphs are built from nodes connected by pointers — C++ makes those pointers visible instead of hiding them behind a garbage collector. Seeing `Node* left` and `Node* right` as real addresses makes "a tree is just linked nodes" concrete instead of abstract.

**Prerequisites:** LAB-05 (Stacks and Queues — C++). This lab reuses `std::queue` and the call-stack mental model directly.

**What this lab adds:**
- Trees: parent-child relationships, depth, the three traversal orders
- Graphs: nodes and edges, adjacency lists, directed vs undirected
- DFS (Depth-First Search) using recursion — the call stack IS the traversal stack
- BFS (Breadth-First Search) using `std::queue` — level by level
- Where this shows up: file systems, the DOM, dependency graphs, routing

**Time:** 75–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A tree is described as "hierarchical." What does that mean, concretely — what can't happen in a tree that CAN happen in a graph?
> 2. If you print a tree's nodes "shallowest first, then next level, then next level," is that depth-first or breadth-first?
> 3. Every tree is technically a graph. Is every graph a tree? Why or why not?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, compiling and running `main.cpp` prints:

```
=== Binary Tree ===
tree built: 8 nodes

preorder:   50 30 20 40 70 60 80
inorder:    20 30 40 50 60 70 80
postorder:  20 40 30 60 80 70 50

max depth: 3
contains 60: yes
contains 99: no

=== Graph: Adjacency List ===
A -> B, C
B -> A, D
C -> A, D
D -> B, C, E
E -> D

=== Graph: DFS from A ===
visited order: A B D C E

=== Graph: BFS from A ===
visited order: A B C D E

=== Directed Graph: Dependency Resolution ===
task graph:
  compile -> [link]
  link -> [package]
  test -> [compile]
  package -> []
build order (topological): test compile link package
```

---

### Concept: What Is a Tree?

**What it is:** A tree is a hierarchy — one root node at the top, and every other node has exactly ONE parent. Nodes with no children are called **leaves**.

**The problem before:** A flat list (array, vector) has no structure between elements beyond position — element 3 has no relationship to element 7 beyond "comes after." Many real-world things are naturally hierarchical: folders contain folders, HTML elements contain elements, org charts have managers and reports. Forcing that into a flat list loses the relationship entirely.

**The solution:** A tree node holds its own value plus pointers to its children. The structure IS the relationship — you don't need a separate "which folder is this file in" lookup table, because the parent node's pointer already tells you.

**Canonical example (General Explanation):**

Think of a family tree, or a company org chart. One person at the top (root). Each person may have people reporting to them (children). Each person has EXACTLY ONE manager (parent) — except the person at the top, who has none. You cannot report to two different managers in a strict tree.

```
        50
       /  \
     30    70
    /  \   /  \
  20  40 60   80
```

**Rules that make it a tree, not just "connected nodes":**
- Exactly one root (no parent)
- Every other node has exactly one parent
- No cycles — you can never follow child pointers back to a node you already visited

**Project Application (The "Why" here):**

The binary tree you build in this lab has, at most, two children per node — `left` and `right`. This specific shape (a **binary search tree**) also keeps values ordered: everything in a node's left subtree is smaller, everything in its right subtree is larger. That ordering is what makes searching fast, and what makes the traversal orders produce meaningfully different sequences.

**Watch for:** "Binary tree" (at most 2 children, no ordering rule) and "binary SEARCH tree" (at most 2 children, AND left-subtree-smaller / right-subtree-larger) are different things. This lab builds the second one.

---

## Step 1 — Build the Node and Insert

Continue in `main.cpp` from LAB-05, or start a fresh file for this lab.

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <string>

using namespace std;

// A tree node: a value plus pointers to (at most) two children.
// 'nullptr' means "no child here" — the C++ equivalent of null.
struct TreeNode {
    int value;
    TreeNode* left;    // ← add: pointer to the left subtree, or nullptr
    TreeNode* right;   // ← add: pointer to the right subtree, or nullptr

    TreeNode(int v) : value(v), left(nullptr), right(nullptr) {}
    // This is a constructor. ': value(v), left(nullptr), right(nullptr)' is an
    // initializer list — it sets each field before the constructor body runs.
};

// Insert a value into a binary SEARCH tree — smaller goes left, larger goes right.
// Returns the (possibly new) root of the subtree — this is how the caller
// links a freshly created node back into the tree.
TreeNode* insert(TreeNode* node, int value) {
    if (node == nullptr) {
        return new TreeNode(value);   // base case: empty spot found — create the node here
    }
    if (value < node->value) {
        node->left = insert(node->left, value);   // recurse into the left subtree
    } else {
        node->right = insert(node->right, value);  // recurse into the right subtree
    }
    return node;   // unchanged subtree root, passed back up
}

int countNodes(TreeNode* node) {
    if (node == nullptr) return 0;                       // base case: empty tree has 0 nodes
    return 1 + countNodes(node->left) + countNodes(node->right);   // this node + both subtrees
}

int main() {
    cout << "=== Binary Tree ===" << endl;

    TreeNode* root = nullptr;
    for (int value : {50, 30, 70, 20, 40, 60, 80}) {   // ← add: insertion order matters for shape
        root = insert(root, value);
    }

    cout << "tree built: " << countNodes(root) << " nodes" << endl;

    return 0;
}
```

### SAVE AND TRY

```bash
g++ main.cpp -o main
./main
```

**Expected:**
```
=== Binary Tree ===
tree built: 7 nodes
```

**In the terminal — see the recursion build the tree:**

Trace it by hand first: inserting `50, 30, 70, 20, 40, 60, 80` in that order produces exactly the tree diagram in the Concept section above. `50` becomes root. `30 < 50` goes left. `70 >= 50` goes right. `20 < 50` goes left, then `20 < 30` goes left again. Continue this by hand for the rest before moving on — you should end up with `50` as root, `30` and `70` as its children, and `20, 40, 60, 80` as the four leaves.

**Change something:** Add `35` to the insertion list. Where does it land? (Answer: right child of `30`, since `35 >= 30` but `35 < 50`.) Change it back.

---

### Concept: The Three Traversal Orders

**What it is:** A **traversal** visits every node in a tree exactly once, in some defined order. For binary trees, there are three classic orders, all defined by WHEN you visit the current node relative to its children.

**The problem before:** "Print the tree" is ambiguous — top to bottom? Left to right? Sorted? Without a defined order, two people printing the same tree could produce completely different sequences with no way to say which is "correct."

**The solution:** Three orders, each useful for a different purpose:

```cpp
// Preorder:  visit THIS node, then left, then right    (node, left, right)
// Inorder:   visit left, then THIS node, then right     (left, node, right)
// Postorder: visit left, then right, then THIS node     (left, right, node)
```

**Canonical example (General Explanation):**

For the tree:
```
        50
       /  \
     30    70
    /  \   /  \
  20  40 60   80
```

- **Preorder** (node, left, right): `50 30 20 40 70 60 80` — visit root first, useful for copying/serializing a tree, since you always create the parent before its children.
- **Inorder** (left, node, right): `20 30 40 50 60 70 80` — for a binary SEARCH tree specifically, this always produces values in SORTED order. This is the whole reason binary search trees are useful.
- **Postorder** (left, right, node): `20 40 30 60 80 70 50` — visit children before the node, useful for deleting a tree (delete children before the parent) or computing a value that depends on both subtrees (like folder size = sum of all file sizes inside it).

**Project Application (The "Why" here):**

Inorder traversal producing sorted output is not a coincidence — it is a direct consequence of the binary-search-tree ordering rule from Step 1 (left is always smaller, right is always larger). This is the payoff of building the tree with that rule.

**Watch for:** All three orders are recursive functions that look almost identical — only the LINE ORDER of "visit node" vs "recurse left" vs "recurse right" changes. If you can write one, you can write all three by rearranging three lines.

---

## Step 2 — Implement the Three Traversals

Add above `main()`:

```cpp
void preorder(TreeNode* node, vector<int>& out) {     // 'vector<int>&' — modify the caller's vector directly
    if (node == nullptr) return;        // base case: nothing to visit
    out.push_back(node->value);         // ← add: visit THIS node first
    preorder(node->left, out);          // ← add: then left
    preorder(node->right, out);         // ← add: then right
}

void inorder(TreeNode* node, vector<int>& out) {
    if (node == nullptr) return;
    inorder(node->left, out);           // ← add: left first
    out.push_back(node->value);         // ← add: THIS node in the middle
    inorder(node->right, out);          // ← add: then right
}

void postorder(TreeNode* node, vector<int>& out) {
    if (node == nullptr) return;
    postorder(node->left, out);         // ← add: left first
    postorder(node->right, out);        // ← add: then right
    out.push_back(node->value);         // ← add: THIS node last
}

void printVector(const string& label, const vector<int>& v) {
    cout << label;
    for (int x : v) cout << x << " ";
    cout << endl;
}
```

Add to `main()`, after the tree is built:

```cpp
vector<int> pre, in, post;
preorder(root, pre);      // ← add
inorder(root, in);        // ← add
postorder(root, post);    // ← add

cout << endl;
printVector("preorder:   ", pre);    // ← add
printVector("inorder:    ", in);     // ← add
printVector("postorder:  ", post);   // ← add
```

### SAVE AND TRY

```bash
g++ main.cpp -o main
./main
```

**Expected new lines:**
```
preorder:   50 30 20 40 70 60 80
inorder:    20 30 40 50 60 70 80
postorder:  20 40 30 60 80 70 50
```

**Confirm the invariant:** `inorder` printed `20 30 40 50 60 70 80` — sorted ascending. This will ALWAYS be true for any binary search tree, regardless of insertion order. Prove it to yourself: mentally insert the same 7 values in a different order (say, `20, 40, 30, 60, 80, 70, 50`) — the tree SHAPE would differ, but inorder traversal still produces the same sorted sequence.

**Change something:** Insert `100` and `10` into the tree before traversing. Predict where each lands and where each appears in all three outputs before running. `10` should be the new first value in inorder (smallest), `100` the new last value (largest).

---

## 🎯 Challenge: Max Depth and Contains

**You know:** Recursive traversal visits every node. A recursive function can also return information ABOUT the tree instead of just printing it.

**Task:** Write two functions:
- `int maxDepth(TreeNode* node)` — returns the number of edges from root to the deepest leaf. An empty tree has depth `-1`; a single node has depth `0`.
- `bool contains(TreeNode* node, int target)` — returns `true` if `target` exists anywhere in the tree. Use the binary-search-tree ordering to avoid checking both subtrees at every node.

**Starting code:**

```cpp
int maxDepth(TreeNode* node) {
    // TODO: base case — empty subtree has depth -1
    // TODO: recursive case — 1 + the larger of the two child depths
}

bool contains(TreeNode* node, int target) {
    // TODO: base case — empty subtree never contains anything
    // TODO: if target == node->value, found it
    // TODO: use target < node->value or target > node->value to pick ONE side to recurse into
}
```

**Hint:** `maxDepth` needs `std::max(a, b)` from `<algorithm>` — add `#include <algorithm>` at the top.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
#include <algorithm>   // for std::max

int maxDepth(TreeNode* node) {
    if (node == nullptr) return -1;    // empty subtree — no edges at all
    return 1 + max(maxDepth(node->left), maxDepth(node->right));
    // 1 (the edge down to this node) + whichever child subtree is deeper
}

bool contains(TreeNode* node, int target) {
    if (node == nullptr) return false;          // fell off the tree — not found
    if (target == node->value) return true;     // found it
    if (target < node->value) return contains(node->left, target);   // only check left
    return contains(node->right, target);       // only check right
}
```

**Key insight:** `contains` never checks both subtrees — the binary-search-tree ordering guarantees the target can only be on ONE side. This is why searching a balanced binary search tree with a million nodes takes about 20 steps (log₂ 1,000,000 ≈ 20), not a million. Each step eliminates half the remaining tree, exactly like `LAB-08`'s binary search will do on a sorted array.

</details>

Add to `main()`:

```cpp
cout << endl;
cout << "max depth: " << maxDepth(root) << endl;                              // ← add
cout << "contains 60: " << (contains(root, 60) ? "yes" : "no") << endl;       // ← add
cout << "contains 99: " << (contains(root, 99) ? "yes" : "no") << endl;       // ← add
```

### SAVE AND TRY

**Expected:**
```
max depth: 3
contains 60: yes
contains 99: no
```

---

### Concept: What Is a Graph?

**What it is:** A graph is nodes (called **vertices**) connected by edges — with NO restriction on how many connections a node can have, and no required "root." A tree is a special, restricted kind of graph. A graph can have cycles; a tree cannot.

**The problem before:** Trees can't represent many-to-many relationships. A file exists in exactly one folder (tree-shaped), but a person can follow many other people who also follow them back (cycles), a web page can link to pages that link back to it, and a city can have roads connecting to multiple other cities in a mesh, not a hierarchy.

**The solution:** Store each node's connections directly, without any "one parent" restriction. The most common representation is an **adjacency list** — a map from each node to the list of nodes it connects to.

**Canonical example (General Explanation):**

Think of a subway map. Station A connects to stations B and C. Station D connects to B, C, and E. There is no "root station" — and you CAN get back to where you started by following a loop of connections (a cycle), which is impossible in a tree.

```
A --- B --- D --- E
|           |
+---- C ----+
```

**Directed vs undirected:**
- **Undirected** — an edge A↔B means you can travel both ways. A friendship graph is undirected.
- **Directed** — an edge A→B means you can go from A to B, but not necessarily back. A "follows" graph on social media, or a dependency graph ("compile depends on link"), is directed.

**Project Application (The "Why" here):**

The undirected graph in this lab models a road network — bidirectional connections. Later in the lab, a DIRECTED graph models task dependencies, where the direction matters: "compile depends on link" is not the same as "link depends on compile."

**Watch for:** In an adjacency list, `graph["A"]` returns a LIST — because unlike a tree node's two named children (`left`, `right`), a graph node can have any number of neighbors.

---

## Step 3 — Build an Adjacency List Graph

Add above `main()`:

```cpp
// An adjacency list: each node name maps to the list of nodes it connects to.
using Graph = unordered_map<string, vector<string>>;

void addEdge(Graph& graph, const string& a, const string& b) {
    graph[a].push_back(b);   // a -> b
    graph[b].push_back(a);   // b -> a  (undirected: both directions)
}

void printGraph(const Graph& graph, const vector<string>& order) {
    for (const string& node : order) {          // print in a fixed order for readable, stable output
        cout << node << " -> ";
        const vector<string>& neighbors = graph.at(node);
        for (size_t i = 0; i < neighbors.size(); i++) {
            cout << neighbors[i];
            if (i + 1 < neighbors.size()) cout << ", ";
        }
        cout << endl;
    }
}
```

Add to `main()`:

```cpp
cout << endl << "=== Graph: Adjacency List ===" << endl;

Graph graph;
addEdge(graph, "A", "B");   // ← add: A and B are connected
addEdge(graph, "A", "C");   // ← add
addEdge(graph, "B", "D");   // ← add
addEdge(graph, "C", "D");   // ← add
addEdge(graph, "D", "E");   // ← add

printGraph(graph, {"A", "B", "C", "D", "E"});   // ← add
```

### SAVE AND TRY

**Expected:**
```
=== Graph: Adjacency List ===
A -> B, C
B -> A, D
C -> A, D
D -> B, C, E
E -> D
```

**Trace it by hand:** `A -> B, C` because `addEdge(A, B)` and `addEdge(A, C)` were both called. `D -> B, C, E` because THREE edges touch `D`: from `addEdge(B, D)`, `addEdge(C, D)`, and `addEdge(D, E)`.

**Change something:** Add `addEdge(graph, "A", "E")`. Run. `A` and `E` now each show one more neighbor. Change it back.

---

### Concept: DFS — Depth-First Search

**What it is:** DFS explores as FAR as possible down one path before backtracking. It picks a neighbor, goes there, then immediately picks THAT node's neighbor, and keeps going deep before ever trying a sibling path.

**The problem before:** Without a systematic strategy, "visit every reachable node" risks visiting the same node twice forever (since graphs can have cycles, unlike trees) — or missing nodes entirely.

**The solution:** Track which nodes have been visited. Recurse into an unvisited neighbor immediately — the call stack itself remembers the path back, exactly like the C++ call stack in LAB-05's undo example remembered the sequence of actions.

**Canonical example (General Explanation):**

Think of exploring a maze by always turning left at every junction and never doubling back until you hit a dead end — then backtrack to the last junction and try the next option. That is depth-first: full commitment to one path before trying alternatives.

```cpp
void dfs(Graph& graph, string node, unordered_set<string>& visited, vector<string>& order) {
    if (visited.count(node)) return;    // already been here — stop (this is what prevents infinite loops)
    visited.insert(node);
    order.push_back(node);
    for (string neighbor : graph[node]) {
        dfs(graph, neighbor, visited, order);   // go AS DEEP as possible before trying the next neighbor
    }
}
```

**What it hides (Law 7):** The exact order neighbors are stored in the adjacency list determines the exact DFS order — DFS is deterministic given a fixed graph representation, but "deepest first" doesn't mean "closest first."

**Where you will see this:** File system traversal (`find` walks directories depth-first), detecting cycles in dependency graphs, solving mazes, and the tree traversals from Step 2 — a binary tree traversal IS a DFS, just on a tree instead of a general graph.

---

## Step 4 — Implement DFS

Add above `main()`:

```cpp
void dfs(const Graph& graph, const string& node, unordered_set<string>& visited, vector<string>& order) {
    if (visited.count(node)) return;         // ← add: already visited — stop here (prevents infinite loop on cycles)
    visited.insert(node);                    // ← add: mark visited BEFORE recursing
    order.push_back(node);                   // ← add: record the visit

    for (const string& neighbor : graph.at(node)) {   // ← add: try each neighbor
        dfs(graph, neighbor, visited, order);          // ← add: go deep immediately
    }
}
```

Add to `main()`:

```cpp
cout << endl << "=== Graph: DFS from A ===" << endl;

unordered_set<string> visitedDfs;
vector<string> dfsOrder;
dfs(graph, "A", visitedDfs, dfsOrder);

cout << "visited order: ";
for (const string& node : dfsOrder) cout << node << " ";   // ← add
cout << endl;
```

### SAVE AND TRY

**Expected:**
```
=== Graph: DFS from A ===
visited order: A B D C E
```

**Trace it by hand:** Start at `A` (visited: A). `A`'s neighbors are `B, C` — go to `B` first (visited: A, B). `B`'s neighbors are `A, D` — `A` is already visited, so go to `D` (visited: A, B, D). `D`'s neighbors are `B, C, E` — `B` visited, go to `C` (visited: A, B, D, C). `C`'s neighbors are `A, D` — both visited, backtrack. Back at `D`, next neighbor is `E` (visited: A, B, D, C, E). Done. Order: `A B D C E`.

**Change something:** Change the starting node to `"E"`. Predict the order before running.

---

### Concept: BFS — Breadth-First Search

**What it is:** BFS explores level by level — every neighbor of the start node first, THEN every neighbor of those neighbors, and so on. It never goes deep before going wide.

**The problem before:** DFS finds *a* path, but not necessarily the SHORTEST one — it might wander deep down one branch before ever trying a closer neighbor. If you need the shortest path in an unweighted graph (fewest hops), DFS gives no guarantee.

**The solution:** Use a queue (LIFO from LAB-05 was the stack — this is the queue, FIFO) instead of the call stack. Add all of a node's neighbors to the back of the queue, then process the FRONT of the queue next — guaranteeing you finish an entire "ring" of neighbors before moving one ring further out.

**Canonical example (General Explanation):**

Think of ripples spreading from a stone dropped in water — the ripple touches every point at distance 1 before it touches any point at distance 2. BFS visits the graph the same way: everything reachable in 1 hop, then everything in 2 hops, then 3, in strict order.

```cpp
void bfs(Graph& graph, string start) {
    queue<string> toVisit;               // reused directly from LAB-05
    unordered_set<string> visited;
    toVisit.push(start);
    visited.insert(start);

    while (!toVisit.empty()) {
        string node = toVisit.front();   // FIFO: process the OLDEST entry
        toVisit.pop();
        // visit node here
        for (string neighbor : graph[node]) {
            if (!visited.count(neighbor)) {
                visited.insert(neighbor);   // mark visited when ENQUEUED, not when processed —
                toVisit.push(neighbor);     // this avoids adding the same node to the queue twice
            }
        }
    }
}
```

**The protected invariant:** Because the queue is FIFO, a node at distance 2 can never be processed before a node at distance 1 — it was enqueued later, so it sits behind every distance-1 node in line.

**Where you will see this:** BFS finds the shortest path in an unweighted graph — this is exactly how "shortest number of clicks" or "degrees of separation" features work. LAB-79 (Pathfinding Visualizer) builds directly on this.

---

## Step 5 — Implement BFS

Add above `main()`:

```cpp
vector<string> bfs(const Graph& graph, const string& start) {
    queue<string> toVisit;                  // ← add: reused from LAB-05 — FIFO
    unordered_set<string> visited;
    vector<string> order;

    toVisit.push(start);                    // ← add
    visited.insert(start);                  // ← add: mark visited at ENQUEUE time

    while (!toVisit.empty()) {              // ← add
        string node = toVisit.front();      // ← add: look at the oldest entry
        toVisit.pop();                      // ← add: remove it
        order.push_back(node);

        for (const string& neighbor : graph.at(node)) {   // ← add
            if (visited.find(neighbor) == visited.end()) {  // ← add: not yet visited
                visited.insert(neighbor);   // ← add: mark BEFORE pushing — prevents duplicate enqueues
                toVisit.push(neighbor);
            }
        }
    }
    return order;
}
```

Add to `main()`:

```cpp
cout << endl << "=== Graph: BFS from A ===" << endl;

vector<string> bfsOrder = bfs(graph, "A");   // ← add
cout << "visited order: ";
for (const string& node : bfsOrder) cout << node << " ";   // ← add
cout << endl;
```

### SAVE AND TRY

**Expected:**
```
=== Graph: BFS from A ===
visited order: A B C D E
```

**Compare directly to DFS:** DFS gave `A B D C E`. BFS gives `A B C D E`. Same graph, same starting node, different order — because BFS finishes ALL of `A`'s direct neighbors (`B`, `C`) before touching anything farther away (`D`, `E`), while DFS committed to the `B → D` path immediately.

**Change something:** Add a `unordered_map<string, int> distance` that records how many hops from `start` each node is (hint: `distance[neighbor] = distance[node] + 1` when you first enqueue it). Print each node's distance from `A`. `B` and `C` should be `1`; `D` should be `2`; `E` should be `3`.

---

## 🎯 Challenge: Topological Sort (Directed Graph)

**You know:** BFS/DFS visit every reachable node. A DIRECTED graph adds the constraint that edges only go one way.

**Task:** Build a directed graph representing build tasks, where an edge `A -> B` means "A must run before B." Compute a valid build order using this algorithm (**Kahn's algorithm**, a BFS variant):

1. Count how many incoming edges ("in-degree") each node has.
2. Start with all nodes that have in-degree 0 (nothing depends on them running first) — add them to a queue.
3. Repeatedly: pop a node, add it to the output order, then decrement the in-degree of each of its neighbors. If a neighbor's in-degree hits 0, enqueue it.

**Starting code:**

```cpp
// Directed graph: edge "test -> compile" means compile must happen before test.
Graph dependsOn = {
    {"test", {"compile"}},        // test depends on compile
    {"compile", {"link"}},        // compile depends on link
    {"link", {"package"}},        // link depends on package
    {"package", {}}               // package depends on nothing
};

vector<string> topologicalSort(const Graph& graph) {
    // TODO: count in-degree for every node
    // TODO: enqueue all nodes with in-degree 0
    // TODO: process the queue, decrementing neighbor in-degrees, enqueueing when they hit 0
    // TODO: return the resulting order
}
```

**Hint:** You need every node name up front, including ones that only appear as a value (like `"link"` appearing inside `test`'s and `compile`'s lists) — collect all node names from both the keys AND the values before counting in-degrees.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
vector<string> topologicalSort(const Graph& graph) {
    unordered_map<string, int> inDegree;

    // Every node starts at in-degree 0, including nodes that never appear as a key.
    for (const auto& [node, neighbors] : graph) {
        inDegree[node];                          // ensures the key exists, defaulted to 0
        for (const string& neighbor : neighbors) {
            inDegree[neighbor]++;                 // one more thing points AT this node
        }
    }

    queue<string> ready;
    for (const auto& [node, degree] : inDegree) {
        if (degree == 0) ready.push(node);        // nothing must happen before this node
    }

    vector<string> order;
    while (!ready.empty()) {
        string node = ready.front();
        ready.pop();
        order.push_back(node);

        if (graph.count(node)) {
            for (const string& neighbor : graph.at(node)) {
                inDegree[neighbor]--;                        // this dependency is now satisfied
                if (inDegree[neighbor] == 0) ready.push(neighbor);  // nothing else blocks it now
            }
        }
    }
    return order;
}
```

**Key insight:** A node only becomes "ready" once EVERY task pointing at it has already run — that's exactly what `inDegree[neighbor] == 0` checks. This is precisely how build systems (Make, npm scripts with dependencies, CI pipeline stages) decide what order to run steps in. If the graph has a cycle (A depends on B, B depends on A), some nodes never reach in-degree 0, and `order.size()` ends up smaller than the total node count — that's how you detect an impossible dependency cycle.

</details>

Add to `main()`:

```cpp
cout << endl << "=== Directed Graph: Dependency Resolution ===" << endl;

Graph dependsOn = {
    {"test", {"compile"}},
    {"compile", {"link"}},
    {"link", {"package"}},
    {"package", {}}
};

cout << "task graph:" << endl;
for (const string& task : {"compile", "link", "test", "package"}) {
    cout << "  " << task << " -> [";
    const vector<string>& deps = dependsOn.at(task);
    for (size_t i = 0; i < deps.size(); i++) {
        cout << deps[i];
        if (i + 1 < deps.size()) cout << ", ";
    }
    cout << "]" << endl;
}

vector<string> order = topologicalSort(dependsOn);
cout << "build order (topological): ";
for (const string& task : order) cout << task << " ";
cout << endl;
```

### SAVE AND TRY

**Expected:**
```
=== Directed Graph: Dependency Resolution ===
task graph:
  compile -> [link]
  link -> [package]
  test -> [compile]
  package -> []
build order (topological): test compile link package
```

**Why this order:** `test` and nothing else starts at in-degree 0 among the tasks that depend on something (only `package` also starts at 0, but it gets picked up once its dependents finish — trace through Kahn's algorithm by hand to see exactly when `package` gets enqueued). The important guarantee: whatever order comes out, no task appears before something it depends on.

---

## Mental Model: Where Trees and Graphs Actually Show Up

| Real system | Structure | Why |
|---|---|---|
| File system | Tree | Every file/folder has exactly one parent folder |
| The DOM (HTML page) | Tree | Every element has exactly one parent element |
| Social network "follows" | Directed graph | A follows B does not require B follows A |
| Road network / GPS routing | Undirected (or weighted directed) graph | Roads often go both ways; BFS/Dijkstra find shortest routes |
| npm/pip package dependencies | Directed graph (must be acyclic) | Package A depending on B, and B depending on A, is an error — exactly the cycle that breaks topological sort |
| Git commit history | Directed acyclic graph | Each commit points to its parent(s); merges have two parents |

**Where you will see this again:**
- LAB-14 (Dependency Graph) — builds directly on this lab's topological sort
- LAB-41 (File Explorer) — renders a tree structure recursively
- LAB-79 (Pathfinding Visualizer) — BFS becomes the shortest-path algorithm on a grid
- LAB-06 through this point used C++; LAB-07 (Recursion) stays in C++ one more lab, since tree/graph traversal and recursion are the same underlying idea viewed from two angles

---

## Final Check

| Feature | How to verify |
|---|---|
| Tree builds 7 nodes from 7 inserted values | `tree built: 7 nodes` |
| Preorder, inorder, postorder each print a different order | Compare all three lines |
| Inorder traversal is sorted ascending | `20 30 40 50 60 70 80` |
| `maxDepth` and `contains` work correctly | `max depth: 3`, `contains 60: yes`, `contains 99: no` |
| Adjacency list graph prints correct neighbors for all 5 nodes | Matches expected output |
| DFS and BFS visit all 5 nodes but in different orders | `A B D C E` vs `A B C D E` |
| Topological sort never puts a task before its dependency | `test` before `compile` before `link` before `package` |
| You can explain DFS vs BFS in one sentence each, without notes | "DFS goes deep first; BFS goes wide first, level by level" |

---

## Quick Check Answers

**1. What does "hierarchical" mean for a tree — what can't happen that CAN happen in a graph?**

In a tree, every node has exactly ONE parent (except the root, which has none), and there are no cycles — you can never follow child pointers back to a node you already visited. In a general graph, a node can have any number of connections in any direction, including back to nodes it already connects to, forming cycles. A tree is a graph with those two extra restrictions.

**2. "Shallowest first, then next level, then next level" — depth-first or breadth-first?**

Breadth-first (BFS). This is the literal definition: visit everything at distance 1 from the start before visiting anything at distance 2. Depth-first would instead follow one path as deep as it goes before backtracking to try a different branch — demonstrated directly in this lab where DFS from `A` produced `A B D C E` (following `A→B→D` all the way before backtracking to `C`), while BFS produced `A B C D E` (finishing `A`'s direct neighbors `B, C` before reaching `D, E`).

**3. Is every graph a tree?**

No. Every tree IS a graph (nodes connected by edges), but not every graph is a tree. A graph becomes a tree only when it additionally has exactly one root, every non-root node has exactly one parent, and there are no cycles. The graph built in Step 3 (`A-B-C-D-E` with multiple paths between nodes, like `A→B→D` and `A→C→D`) is NOT a tree — there are two different paths from `A` to `D`, which is a cycle when you consider the undirected edges, and no single node qualifies as "the root."

---

*Next: [LAB-07 — Recursion](LAB-07-recursion.md) — C++*
