# Lesson 15: Depth-First Search (DFS)

**What you will build:** You will write graph traversal algorithms that explore as far down a specific path as possible before backtracking. These programs demonstrate how to traverse and analyze network structures recursively and iteratively. The transferable problem this solves is finding deep paths, detecting structural loops (cycles), and resolving dependency orders (topological sort) in arbitrary graphs.

**What you need to know first:** Lesson 13 Graph Fundamentals, Lesson 14 Breadth-First Search (BFS).

**Terms used in this lesson:**
- **Depth-First Search (DFS)** — A graph traversal strategy that follows a single path to its very end before turning back to try alternatives. *Why it exists:* To fully explore deep branches or validate complete paths (like solving a maze) without needing to hold all shallow neighbors in memory simultaneously.
- **Backtracking** — Returning to a previous node after exploring all of its outgoing paths. *Why it exists:* To resume exploring alternative branches that were left behind when diving deep into the first available path.
- **Visited set** — A collection tracking nodes that have already been explored. *Why it exists:* To prevent infinite loops when traversing graphs that contain cycles or redundant paths.
- **Cycle detection** — The process of finding a path that loops back to a node currently being actively explored. *Why it exists:* To identify circular dependencies or infinite loops in a network.
- **Topological sort** — A linear ordering of vertices such that for every directed edge from node A to node B, A comes before B. *Why it exists:* To schedule tasks, compile code, or resolve dependencies where certain steps must rigidly happen before others.

**Objects and methods used:**
- **`std::stack<T>` / `push` / `pop` / `top`**
  - *What it is:* A Last-In-First-Out (LIFO) data structure from the C++ Standard Library.
  - *Implementation:* `void push(const T& value);`, `void pop();`, `T& top();`
  - *Its use:* Manages the iterative DFS path by inherently tracking the most recently discovered, yet-to-be-explored nodes.
- **`std::vector<T>` / `rbegin` / `rend`**
  - *What it is:* Iterator methods for a dynamic array.
  - *Implementation:* `reverse_iterator rbegin();`, `reverse_iterator rend();`
  - *Its use:* Iterates backwards through a collection, used here to reverse output or push children to a stack in reverse order so they pop in the original order.
- **`std::reverse`**
  - *What it is:* An algorithm that reverses the order of elements in a range.
  - *Implementation:* `void reverse(BidirIt first, BidirIt last);`
  - *Its use:* Flips a post-order traversal sequence backward to compute a final topological sort.

---

## Concept Unit: Recursive DFS and the Visited Set

### The Problem
When navigating a graph, you often need to explore a branch to its absolute completion before looking at sibling branches. If the graph contains cycles or converging paths, blindly following edges will trap the program in an infinite loop. You need a mechanism that drives the traversal deep while explicitly ignoring nodes it has already seen.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <unordered_set>

void dfsRecursive(int node, const std::vector<std::vector<int>>& graph, std::unordered_set<int>& visited) {
    if (visited.count(node)) return;
    
    std::cout << "Visiting: " << node << "\n";
    visited.insert(node);
    
    for (int neighbor : graph[node]) {
        dfsRecursive(neighbor, graph, visited);
    }
}

int main() {
    std::vector<std::vector<int>> graph = {
        {1, 2},    // Node 0 connects to 1, 2
        {3, 4},    // Node 1 connects to 3, 4
        {4},       // Node 2 connects to 4
        {},        // Node 3 has no outgoing edges
        {}         // Node 4 has no outgoing edges
    };
    
    std::unordered_set<int> visited;
    dfsRecursive(0, graph, visited);
    
    return 0;
}
```

### Mechanical Walkthrough
- `void dfsRecursive(...)`: Defines the recursive function taking the current `node`, the adjacency list `graph`, and a reference to the `visited` set. Passing the set by reference ensures all recursive calls share the same memory.
- `if (visited.count(node)) return;`: The base case for redundant paths. If the node is already in the set, the function immediately stops and backtracks, preventing infinite loops.
- `std::cout << "Visiting: " << node << "\n";`: Processes the node immediately upon entry.
- `visited.insert(node);`: Marks the node as seen so future branches that also link to this node will not re-enter it.
- `for (int neighbor : graph[node])`: Iterates over every outgoing edge from the current node.
- `dfsRecursive(neighbor, graph, visited);`: Recursively dives into the neighbor. It will explore this neighbor to its absolute completion before moving to the next neighbor in the loop.

### CS Lens
This is Depth-First Search implemented via recursion. It relies entirely on the system's Call Stack. Each recursive call suspends the current node's iteration, pushes a new frame onto the stack, and dives into the child. Only when a path hits a dead end (a node with no unvisited neighbors) does the function return, popping the frame and resuming the parent's loop—this automatic resumption is backtracking. Also recognized in: maze solving algorithms, abstract syntax tree traversal, and garbage collection tracing.

### SE Lens
The alternative not chosen is BFS using a queue. The tradeoff here is memory shape. DFS uses memory proportional to the maximum depth of the graph (the height of the recursion tree), while BFS uses memory proportional to the widest layer. If the graph is extremely deep, recursive DFS risks a stack overflow crash because the system call stack has a hard size limit.

### Run It Yourself
1. Open a terminal and create a file named `dfs_recursive.cpp`.
2. Compile it: `g++ -std=c++17 dfs_recursive.cpp -o dfs_recursive`.
3. Run the executable: `./dfs_recursive`.
4. Observe the output. Notice the traversal goes 0 -> 1 -> 3, exploring a full path to a dead end before coming back to 4.

---

## Concept Unit: Iterative DFS

### The Problem
Recursive DFS is elegant, but system call stacks are limited. A deeply nested graph (e.g., 100,000 nodes in a straight line) will cause a stack overflow and crash your program. You need a way to perform the exact same deep traversal using heap memory instead of the call stack.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <unordered_set>
#include <stack>

int main() {
    std::vector<std::vector<int>> graph = {
        {1, 2},
        {3, 4},
        {4},
        {},
        {}
    };
    
    std::stack<int> s;
    std::unordered_set<int> visited;
    
    s.push(0);
    
    while (!s.empty()) {
        int node = s.top();
        s.pop();
        
        if (!visited.count(node)) {
            std::cout << "Visiting: " << node << "\n";
            visited.insert(node);
            
            for (auto it = graph[node].rbegin(); it != graph[node].rend(); ++it) {
                if (!visited.count(*it)) {
                    s.push(*it);
                }
            }
        }
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <stack>`: Brings in the definition for the Last-In-First-Out `std::stack` container.
- `s.push(0);`: Seeds the stack with the starting node.
- `while (!s.empty())`: Continues processing as long as there are discovered nodes left to explore.
- `int node = s.top(); s.pop();`: Retrieves the most recently added node and removes it from the stack. LIFO behavior means we always dig into the newest path discovered, creating the depth-first effect.
- `if (!visited.count(node))`: Because a node might be pushed to the stack multiple times via different paths before it is visited, we check its visited status right after popping it, not before pushing it.
- `auto it = graph[node].rbegin(); it != graph[node].rend(); ++it`: Iterates backward through the adjacency list. By pushing neighbors onto the stack in reverse order, the very first neighbor gets popped and processed first, perfectly mirroring the left-to-right order of the recursive version.

### CS Lens
This is an iterative formulation of DFS. By manually managing a `std::stack` allocated on the heap, you bypass the operating system's strict call stack limits. The algorithm remains identical in time complexity, but you gain the capacity to search massively deep graphs safely. 

### SE Lens
The alternative not chosen is keeping the recursive approach. The tradeoff is boilerplate and readability versus safety. Recursive DFS is fewer lines of code and often easier to read, but iterative DFS is industrial-grade: it will not crash on worst-case deep inputs.

### Run It Yourself
1. Save the code in `dfs_iterative.cpp`.
2. Compile and run it. 
3. Observe that the exact same visitation order (0, 1, 3, 4, 2) is produced as the recursive version.

---

## Concept Unit: Cycle Detection

### The Problem
A standard `visited` set stops infinite loops, but it only tells you if a node was seen *at any point in the past*. Sometimes you need to know if the graph contains a structural loop (a cycle). If you hit an already-visited node, is it just a converging path, or is it a back-link creating an inescapable circle? You need to track the active path currently being explored.

### The New Code
```cpp
#include <iostream>
#include <vector>

bool hasCycle(int node, const std::vector<std::vector<int>>& graph, std::vector<int>& state) {
    if (state[node] == 1) return true;  
    if (state[node] == 2) return false; 
    
    state[node] = 1; 
    
    for (int neighbor : graph[node]) {
        if (hasCycle(neighbor, graph, state)) {
            return true;
        }
    }
    
    state[node] = 2; 
    return false;
}

int main() {
    std::vector<std::vector<int>> graph = {
        {1},       // 0 -> 1
        {2},       // 1 -> 2
        {0}        // 2 -> 0 (Cycle!)
    };
    
    std::vector<int> state(graph.size(), 0);
    
    if (hasCycle(0, graph, state)) {
        std::cout << "Cycle detected!\n";
    } else {
        std::cout << "No cycle found.\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `std::vector<int> state(graph.size(), 0);`: Instead of a boolean `visited` set, we use an array representing three distinct states for each node: `0` (unvisited), `1` (currently visiting in the active path), and `2` (fully processed and exited).
- `if (state[node] == 1) return true;`: If we encounter a node with state `1`, it means we are currently still inside its recursive call stack. Finding it again proves there is a loop.
- `if (state[node] == 2) return false;`: If we hit state `2`, we reached this node via a different path entirely, but it led to no cycles, so it is safe.
- `state[node] = 1;`: Marks the node as actively being explored.
- `if (hasCycle(neighbor, graph, state)) return true;`: Recursively explores neighbors. If any neighbor reports a cycle, the `true` bubbles all the way up immediately.
- `state[node] = 2;`: After the loop finishes, all descendant paths have been validated. We explicitly mark this node as fully processed, removing it from the "active" path.

### CS Lens
This is Cycle Detection in a directed graph using graph coloring (White=0, Gray=1, Black=2). A cycle specifically requires a "back-edge"—an edge pointing back to an ancestor currently on the traversal stack. By keeping nodes "Gray" only while their stack frame is alive, we isolate back-edges from harmless cross-edges.

### SE Lens
The alternative not chosen is tracking an active path using a hash set that inserts on entry and deletes on exit. The tradeoff is performance. While a hash set works, managing states `0`, `1`, and `2` in a flat vector guarantees constant-time `O(1)` state updates and checks without hashing overhead, drastically improving speed on large graphs.

### Run It Yourself
1. Save the code in `cycle_detect.cpp`.
2. Compile and run it. 
3. Observe that it correctly identifies the back-link from node 2 to node 0.

---

## Concept Unit: Topological Sort

### The Problem
When items depend on each other—like compiling C++ files where `B` includes `A`, or task scheduling where framing a house must finish before roofing begins—you must compute a valid linear execution order. You need an algorithm that processes a graph and guarantees that no item is output until all of its dependencies have been handled.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <unordered_set>
#include <algorithm>

void dfsTopo(int node, const std::vector<std::vector<int>>& graph, std::unordered_set<int>& visited, std::vector<int>& order) {
    if (visited.count(node)) return;
    visited.insert(node);
    
    for (int neighbor : graph[node]) {
        dfsTopo(neighbor, graph, visited, order);
    }
    
    order.push_back(node);
}

int main() {
    std::vector<std::vector<int>> graph = {
        {1, 2},    // Task 0 must happen before Task 1, 2
        {3},       // Task 1 must happen before Task 3
        {3},       // Task 2 must happen before Task 3
        {}         // Task 3 has no dependents
    };
    
    std::unordered_set<int> visited;
    std::vector<int> order;
    
    for (int i = 0; i < graph.size(); ++i) {
        dfsTopo(i, graph, visited, order);
    }
    
    std::reverse(order.begin(), order.end());
    
    std::cout << "Execution Order: ";
    for (int task : order) {
        std::cout << task << " ";
    }
    std::cout << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `void dfsTopo(...)`: A standard recursive DFS, heavily augmented by an `order` vector passed by reference.
- `order.push_back(node);`: This is placed *after* the `for` loop finishes. The crucial guarantee of DFS is that when the `for` loop ends, all possible descendants of `node` have already been fully processed. This is a post-order traversal.
- `for (int i = 0; i < graph.size(); ++i)`: A graph might be disconnected (e.g., disjoint islands of tasks). This loop ensures that every node in the graph is visited, even if node 0 didn't connect to everything.
- `std::reverse(order.begin(), order.end());`: Because nodes are pushed to `order` exactly when they have *nothing left to do*, the node with no outgoing edges at all gets added first. To get the order of execution from start to finish, the entire sequence is reversed at the very end.

### CS Lens
This is Topological Sort. It relies heavily on post-order DFS. Because DFS naturally hits the absolute bottom of a path before bouncing back, appending to a list at the moment of bouncing back records the deepest, most dependent tasks first. Reversing that list gives you the perfectly sorted dependency chain. Also recognized in: package managers resolving installs, build systems like `make` or `cmake`, and spreadsheet cell updates.

### SE Lens
The alternative not chosen is Kahn’s Algorithm (an iterative BFS-like approach tracking incoming edge counts). The tradeoff is structure. DFS-based topological sort is incredibly concise and easy to write, but it requires reversing the output array at the end and silently ignores cycles if you forget to add cycle-detection logic. Kahn's Algorithm explicitly fails if a cycle is present, making it generally safer for critical build tools.

### Run It Yourself
1. Save the code in `topo_sort.cpp`.
2. Compile and run it. 
3. Observe the output: `0 2 1 3` or `0 1 2 3`. Task 0 always runs first, and Task 3 always runs last.

---

## Connect the Pieces

In this lesson, you observed how exploring graphs to their absolute limits uncovers powerful properties. Depth-First Search relies on memory—either the system Call Stack or a heap-allocated `std::stack`—to implicitly track where it needs to return once a path exhausts itself. By simply repositioning where you execute code (before the loop for visitation, inside the loop for cycle checking, or after the loop for topological sorting), you transformed a basic traversal into three entirely different architectural algorithms.

## What Breaks Without This

If you omit the visited check in a graph with cycles, your program will crash instantly. 

Remove the `visited` logic from the iterative DFS:
```cpp
// Remove this if block:
// if (!visited.count(node))
```

Run it on a graph with a loop (`0 -> 1 -> 0`). The stack will continuously push `0`, pop it, push `1`, pop it, push `0`, forever. The program will hang consuming CPU resources infinitely, or if running the recursive version, terminate forcefully due to a `Segmentation fault (core dumped)` as the call stack overflows.

## Exercises

1. **Count the Islands:** Write a program that iterates over a grid (represented as an adjacency list of connected land plots). Use DFS to count how many distinct "islands" exist. Every time you trigger DFS from `main`, increment an island counter.
2. **Path Finder:** Modify the recursive DFS to return a `bool`. If the search finds a target node, return `true` immediately without exploring further. This demonstrates searching for existence rather than exhausting the graph.
3. **Safe Topo Sort:** Combine the concepts. Modify `dfsTopo` to include the `state` vector logic from Cycle Detection. If a cycle is detected during topological sort, throw an error instead of producing an invalid execution order.

## Definition of Done

- [ ] You have compiled and executed both recursive and iterative DFS.
- [ ] You have observed a cycle being accurately detected using three-state tracking.
- [ ] You have generated a topological order using post-order DFS and `std::reverse`.
- [ ] You can explain why DFS topological sort appends elements *after* the neighbor loop.
- [ ] You understand why iterative DFS uses a LIFO stack to mirror recursion.
