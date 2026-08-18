# Lesson 14: Breadth-First Search (BFS)

**What you will build:** You will write isolated console programs that traverse graphs radiating outward level by level. These programs demonstrate how to explore a network, guarantee you don't get trapped in cycles, and find the absolute shortest path between two points in an unweighted graph. The transferable problem this solves is finding optimal routes and exploring states evenly without diving blindly down dead ends.

**What you need to know first:** Lesson 13 Graph Fundamentals (adjacency lists), Lesson 12 Standard Library Containers (`std::vector`, `std::unordered_set`).

**Terms used in this lesson:**
- **Breadth-First Search (BFS)** — An algorithm that explores a graph level by level, visiting all immediate neighbors of a node before moving deeper. *Why it exists:* To guarantee that the first time you reach a node, you have found the shortest possible path to it in an unweighted graph.
- **Level-order exploration** — Processing nodes in waves, grouped by their distance from the starting point. *Why it exists:* To ensure uniform outward expansion, preventing the search from committing to a long path before checking adjacent options.
- **Visited set** — A collection tracking which nodes have already been added to the queue. *Why it exists:* To prevent infinite loops when a graph contains cycles, ensuring each node is processed exactly once.
- **BFS Tree** — A structural byproduct of a BFS traversal, recording the single path used to discover each node. *Why it exists:* To allow tracing the exact sequence of steps backward from a destination to the start.

**Objects and methods used:**
- **`std::queue<T>` / `push`, `front`, `pop`**
  - *What it is:* A First-In-First-Out (FIFO) data structure.
  - *Implementation:* `void push(const T& value);`, `T& front();`, `void pop();`
  - *Its use:* Controls the exploration order by ensuring nodes discovered first are processed first.
- **`std::unordered_set<T>` / `insert`, `count`**
  - *What it is:* A hash-based collection of unique elements.
  - *Implementation:* `std::pair<iterator, bool> insert(const T& value);`, `size_type count(const T& key) const;`
  - *Its use:* Tracks visited nodes in constant time to prevent reprocessing.
- **`std::vector<T>` / `assign`**
  - *What it is:* A dynamic array container.
  - *Implementation:* `void assign(size_type count, const T& value);`
  - *Its use:* Quickly resets tracking arrays (like distances or parent pointers) to a default value before a search begins.
- **`std::reverse`**
  - *What it is:* A standard library algorithm that flips the order of elements in a range.
  - *Implementation:* `void reverse(BidirIt first, BidirIt last);`
  - *Its use:* Reverses the backward-traced parent path so it reads correctly from start to finish.

---

## Concept Unit: Level-Order Exploration (The Queue Mechanism)

### The Problem
How do you explore a graph by expanding outward evenly? Recursion naturally dives deep, pursuing one path to its absolute end before checking alternative branches. If you want to process all immediate neighbors before looking at their neighbors, you need a mechanism that forces a "first discovered, first processed" ordering.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating the core algorithmic mechanism in an isolated file.
- **Files affected**: Create `bfs_queue.cpp`.
- **Change type**: Add.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <queue>

int main() {
    // Adjacency list for a Directed Acyclic Graph (DAG)
    std::vector<std::vector<int>> graph = {
        {1, 2},    // Node 0 points to 1, 2
        {3},       // Node 1 points to 3
        {3},       // Node 2 points to 3
        {}         // Node 3 has no outgoing edges
    };

    std::queue<int> frontier;
    frontier.push(0);

    while (!frontier.empty()) {
        int current = frontier.front();
        frontier.pop();

        std::cout << "Visiting node " << current << "\n";

        for (int neighbor : graph[current]) {
            frontier.push(neighbor);
        }
    }

    return 0;
}
```

### Mechanical Walkthrough
- `#include <queue>`: Instructs the compiler to include the definition for the `std::queue` container adapter, which provides strict First-In-First-Out semantics.
- `std::vector<std::vector<int>> graph`: Defines the graph as an adjacency list. The outer vector represents the nodes, and each inner vector holds the outgoing edges for that specific node.
- `std::queue<int> frontier`: Instantiates a queue of integers. The name "frontier" reflects its purpose: it holds the boundary of our exploration, the nodes we have discovered but not yet processed.
- `frontier.push(0)`: Enqueues the starting node (`0`). The loop requires at least one item to begin.
- `while (!frontier.empty())`: The loop condition. It continues as long as there are discovered nodes waiting to be processed.
- `int current = frontier.front()`: Retrieves the value at the front of the queue without removing it. Because it is a queue, this is guaranteed to be the oldest discovered node.
- `frontier.pop()`: Removes the front element from the queue. `front()` and `pop()` are deliberately separate methods in C++ to guarantee exception safety.
- `std::cout << "Visiting node " << current << "\n"`: Prints the node, proving the exact order in which the algorithm processes them.
- `for (int neighbor : graph[current])`: A range-based for loop traversing the inner vector. It iterates over every outgoing edge from the `current` node.
- `frontier.push(neighbor)`: Adds each discovered neighbor to the back of the queue. They will wait their turn until all previously discovered nodes are processed.

Execution trace for the queue:
1. `push(0)` — Queue holds `[0]`.
2. `current = 0`, `pop()` — Queue is empty. We push `1` and `2`. Queue holds `[1, 2]`.
3. `current = 1`, `pop()` — Queue holds `[2]`. We push `3`. Queue holds `[2, 3]`.
4. `current = 2`, `pop()` — Queue holds `[3]`. We push `3`. Queue holds `[3, 3]`.
5. `current = 3`, `pop()` — Queue holds `[3]`. Node 3 has no neighbors.
6. `current = 3`, `pop()` — Queue is empty. Loop ends.

### CS Lens
This is **Breadth-First Search (BFS)**. By using a FIFO queue, we enforce a strict level-order traversal. All nodes at distance 1 are queued behind the start node. All nodes at distance 2 are queued behind the distance 1 nodes. 
Also recognized in: peer-to-peer network broadcasting, web crawlers mapping domains, garbage collection algorithms.

### SE Lens
The alternative not chosen is using a `std::stack` (LIFO). If you swap the queue for a stack, the algorithm immediately becomes Depth-First Search (DFS), diving down the most recently discovered path instead of the oldest. The tradeoff is memory shape: BFS must hold the entire width of the current level in memory, which for a dense graph can be significantly larger than the single deep path DFS holds.

### Run It Yourself
1. Compile: `g++ -std=c++17 bfs_queue.cpp -o bfs_queue`
2. Run: `./bfs_queue`
3. Observe the output:
```text
Visiting node 0
Visiting node 1
Visiting node 2
Visiting node 3
Visiting node 3
```
Notice that Node 3 is visited twice. This leads us to the next problem.

### Discard the Example
This isolated queue demonstration is deleted and will not appear in the final project. It exists only to prove the queue mechanism.

---

## Concept Unit: The Visited Set (Avoiding Cycles)

### The Problem
In the previous example, Node 3 was processed twice because both Node 1 and Node 2 pointed to it. If our graph had a cycle—Node 3 pointing back to Node 0—the queue would never empty. The loop would enqueue 0, 1, 2, 3, 0, 1, 2, 3 forever. You need a mechanism to remember which nodes have already been discovered so they are processed exactly once.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Create `bfs_visited.cpp`.
- **Change type**: Add.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <unordered_set>

int main() {
    // Adjacency list for a graph with a cycle: 0 -> 1 -> 2 -> 0
    std::vector<std::vector<int>> graph = {
        {1},       // Node 0 points to 1
        {2},       // Node 1 points to 2
        {0, 3},    // Node 2 points to 0 (cycle!) and 3
        {}         // Node 3 points nowhere
    };

    std::queue<int> frontier;
    std::unordered_set<int> visited;

    frontier.push(0);
    visited.insert(0); // Mark as visited the moment it enters the queue

    while (!frontier.empty()) {
        int current = frontier.front();
        frontier.pop();

        std::cout << "Visiting node " << current << "\n";

        for (int neighbor : graph[current]) {
            if (visited.count(neighbor) == 0) {
                visited.insert(neighbor);
                frontier.push(neighbor);
            }
        }
    }

    return 0;
}
```

### Mechanical Walkthrough
- `#include <unordered_set>`: Instructs the compiler to include the hash-based set container.
- `std::vector<std::vector<int>> graph`: The adjacency list now contains a cycle. Node 2 points back to Node 0.
- `std::unordered_set<int> visited`: Instantiates a collection that will hold only unique integers, storing the IDs of nodes we have already seen.
- `visited.insert(0)`: Marks the start node as visited immediately. This is critical: nodes must be marked visited *when they are pushed to the queue*, not when they are popped.
- `if (visited.count(neighbor) == 0)`: Calls `count` on the set. Since a set can hold at most one copy of any item, `count` returns `0` if the item is absent and `1` if it is present. This checks if we have already discovered this neighbor.
- `visited.insert(neighbor)`: Adds the neighbor to the visited set. Because this happens inside the `if` block, we guarantee no node is ever pushed into the queue twice.
- `frontier.push(neighbor)`: Enqueues the neighbor only because it passed the visited check. 

Execution trace for the cycle prevention:
1. Node 2 is popped. Its neighbors are `0` and `3`.
2. Evaluates `visited.count(0)`. Because Node 0 was inserted at the very beginning, this returns `1`.
3. The `if` condition fails. Node 0 is ignored, breaking the infinite cycle.
4. Evaluates `visited.count(3)`. Returns `0`. Node 3 is marked visited and pushed to the queue.

### CS Lens
This combination of a queue and a visited set forms the complete, standard **Breadth-First Search** algorithm. The visited set transforms the problem of traversing an arbitrary, potentially cyclic graph into traversing a clean, acyclic tree structure rooted at the start node.

### SE Lens
The alternative not chosen is placing `visited.insert(current)` at the top of the `while` loop, after popping. The tradeoff is efficiency. If you wait until a node is popped to mark it visited, multiple edges pointing to the same undiscovered node will cause it to be pushed into the queue multiple times, wasting memory and queue operations. Marking it visited at the exact moment of discovery prevents this redundant queuing.

### Run It Yourself
1. Compile: `g++ -std=c++17 bfs_visited.cpp -o bfs_visited`
2. Run: `./bfs_visited`
3. Observe the output. The program prints nodes 0, 1, 2, and 3 exactly once, and terminates successfully despite the cycle.

### Discard the Example
This cycle-prevention demonstration is deleted and will not appear in the final project.

---

## Concept Unit: Shortest Path in an Unweighted Graph

### The Problem
Knowing that we can reach a node is useful, but often we need to know the minimum number of steps required to get there. Because BFS expands in uniform waves, the first time it reaches a node, it has inherently found the shortest path. We need to record this distance as the wave expands.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Create `bfs_distance.cpp`.
- **Change type**: Add.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <queue>

int main() {
    std::vector<std::vector<int>> graph = {
        {1, 2},    // 0
        {3},       // 1
        {3},       // 2
        {4},       // 3
        {}         // 4
    };

    std::queue<int> frontier;
    std::vector<int> distance;
    distance.assign(graph.size(), -1);

    frontier.push(0);
    distance[0] = 0; // Distance to start node is always 0

    while (!frontier.empty()) {
        int current = frontier.front();
        frontier.pop();

        for (int neighbor : graph[current]) {
            if (distance[neighbor] == -1) {
                distance[neighbor] = distance[current] + 1;
                frontier.push(neighbor);
            }
        }
    }

    for (int i = 0; i < distance.size(); ++i) {
        std::cout << "Distance to " << i << ": " << distance[i] << "\n";
    }

    return 0;
}
```

### Mechanical Walkthrough
- `std::vector<int> distance`: Instantiates a vector to track the shortest distance from the start node to every other node. 
- `distance.assign(graph.size(), -1)`: Calls the `assign` method on the vector. This resizes the vector to match the total number of nodes in the graph and fills every slot with `-1`. We use `-1` as a sentinel value meaning "unvisited".
- `distance[0] = 0`: Explicitly sets the distance to the starting node to `0`. It takes zero edges to reach the start from the start. This also implicitly marks Node 0 as visited.
- `if (distance[neighbor] == -1)`: Checks if the neighbor has been visited yet. By doubling the `distance` array's role to also act as our visited check, we eliminate the need for a separate `std::unordered_set`.
- `distance[neighbor] = distance[current] + 1`: The core distance logic. Because the neighbor is exactly one edge away from `current`, its shortest path distance is exactly one greater than `current`'s shortest path distance.
- `frontier.push(neighbor)`: Queues the newly discovered neighbor for later expansion.

Execution trace for the distance calculation:
1. `current = 0` (distance 0). Neighbors are 1 and 2.
2. `distance[1]` becomes `0 + 1 = 1`. Pushed to queue.
3. `distance[2]` becomes `0 + 1 = 1`. Pushed to queue.
4. `current = 1` (distance 1). Neighbor is 3. `distance[3]` becomes `1 + 1 = 2`. Pushed.
5. `current = 2` (distance 1). Neighbor is 3. `distance[3]` is already `2` (not `-1`), so it is ignored.

### CS Lens
This is the **Single-Source Shortest Path** algorithm for unweighted graphs. Because BFS guarantees that nodes at distance `d` are processed completely before any node at distance `d + 1`, the addition `distance[current] + 1` is mathematically proven to be the absolute minimum edge count.
Also recognized in: Six Degrees of Kevin Bacon, routing protocols like RIP, solving unweighted mazes.

### SE Lens
The alternative not chosen is using Dijkstra's algorithm with a priority queue. The tradeoff is unnecessary complexity. Dijkstra's handles varying edge weights (costs), requiring logarithmic time per queue operation to sort them. When all edges have identical weight (unweighted), the FIFO queue of BFS naturally maintains the sorted order for "free" in constant time. Using Dijkstra's on an unweighted graph is a waste of computation.

### Run It Yourself
1. Compile: `g++ -std=c++17 bfs_distance.cpp -o bfs_distance`
2. Run: `./bfs_distance`
3. Observe the output. The distance to node 4 is correctly calculated as 3.

### Discard the Example
This distance-tracking example is deleted and will not appear in the final project.

---

## Concept Unit: The BFS Tree (Path Reconstruction)

### The Problem
Knowing the shortest distance is 3 tells you *how long* the path is, but it doesn't tell you *what* the path is. If you are writing a pathfinding AI, the character needs the exact sequence of nodes to walk through. You need to record the trail as you explore so you can reconstruct it later.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Create `bfs_path.cpp`.
- **Change type**: Add.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

int main() {
    std::vector<std::vector<int>> graph = {
        {1, 2},    // 0
        {3},       // 1
        {3},       // 2
        {4},       // 3
        {}         // 4
    };

    std::queue<int> frontier;
    std::vector<int> parent;
    parent.assign(graph.size(), -1);

    frontier.push(0);
    parent[0] = -2; // Distinct sentinel for the start node

    while (!frontier.empty()) {
        int current = frontier.front();
        frontier.pop();

        if (current == 4) break; // Stop early if we found our target

        for (int neighbor : graph[current]) {
            if (parent[neighbor] == -1) {
                parent[neighbor] = current;
                frontier.push(neighbor);
            }
        }
    }

    // Path Reconstruction
    std::vector<int> path;
    int backtrack = 4;
    while (backtrack != -2) {
        path.push_back(backtrack);
        backtrack = parent[backtrack];
    }
    std::reverse(path.begin(), path.end());

    std::cout << "Shortest path to 4: ";
    for (int n : path) {
        std::cout << n << " ";
    }
    std::cout << "\n";

    return 0;
}
```

### Mechanical Walkthrough
- `#include <algorithm>`: Brings in algorithms like `std::reverse`.
- `std::vector<int> parent`: Instantiates an array to hold the "parent" of each node—the ID of the node that first discovered it.
- `parent.assign(graph.size(), -1)`: Fills the array with `-1`, using it as our "unvisited" sentinel value just like we did with the distance array.
- `parent[0] = -2`: Assigns `-2` to the start node's parent. Because the start node wasn't discovered by any other node, it has no real parent. We use a distinct negative number so we know exactly when to stop tracing backward.
- `if (current == 4) break;`: An early exit condition. If our goal is only to reach Node 4, we can stop the search entirely the moment we process it. Exploring the rest of the graph is wasted effort.
- `parent[neighbor] = current`: The core tree-building logic. When `current` discovers `neighbor`, we record `current` into `neighbor`'s slot. This leaves a breadcrumb trail pointing back to the start.
- `std::vector<int> path`: Creates a vector to hold our final reconstructed path.
- `int backtrack = 4`: Initializes a local variable starting at our destination node.
- `while (backtrack != -2)`: Loops backward through the `parent` array until it hits the `-2` sentinel we placed at the start node.
- `path.push_back(backtrack)`: Appends the current node in our backward trace to the path vector.
- `backtrack = parent[backtrack]`: Overwrites `backtrack` with its own parent, effectively stepping one hop backward toward the start node.
- `std::reverse(path.begin(), path.end())`: Because we traced backward from destination to start, the vector is reversed. This algorithm flips it in place so it reads start to destination.

Execution trace for path reconstruction:
1. `backtrack = 4`. Added to path. `parent[4]` is `3`.
2. `backtrack = 3`. Added to path. `parent[3]` is `1` (assuming Node 1 discovered 3 first).
3. `backtrack = 1`. Added to path. `parent[1]` is `0`.
4. `backtrack = 0`. Added to path. `parent[0]` is `-2`. Loop ends.
5. Path vector is `[4, 3, 1, 0]`. Reversed, it becomes `[0, 1, 3, 4]`.

### CS Lens
The `parent` array represents the **BFS Tree** (or Shortest Path Tree). Even if the original graph has thousands of cross-edges and cycles, the edges recorded in the `parent` array form a strict tree with the start node at the root. Every path down this tree is the shortest path to that node.

### SE Lens
The alternative not chosen is storing a `std::vector<int> path` inside every single node or pushing full paths into the queue. The tradeoff is memory consumption. Copying a full vector of history for every step of the search takes massive amounts of memory and `O(N)` time per step. Storing a single integer `parent` per node takes minimal memory and reconstructed the path in `O(N)` time only once at the very end. 

### Run It Yourself
1. Compile: `g++ -std=c++17 bfs_path.cpp -o bfs_path`
2. Run: `./bfs_path`
3. Observe the output:
```text
Shortest path to 4: 0 1 3 4 
```

### Discard the Example
This path reconstruction example is deleted and will not appear in the final project.

---

## Connect the Pieces

Observe how the algorithm evolved from a naive expansion into a robust routing tool. A bare `std::queue` enforced the level-order traversal, expanding equally in all directions. Adding a `visited` check—whether using a `std::unordered_set`, or doubling up a `distance` or `parent` array for the job—safely cut through cycles and prevented infinite loops. Finally, recording the step count or the parent ID during that expansion provided the exact shortest path through the network. The identical queue loop sits at the center of all these features.

## What Breaks Without This

If you omit the visited check entirely, a graph with a single cycle will freeze your program.

Modify `bfs_path.cpp` and comment out the `if (parent[neighbor] == -1)` check, allowing unconditional pushing:
```cpp
// if (parent[neighbor] == -1) {
    parent[neighbor] = current;
    frontier.push(neighbor);
// }
```

If the graph contains a cycle (like `0 -> 1 -> 0`), the queue will endlessly enqueue `1`, then `0`, then `1`. The `while (!frontier.empty())` loop will never terminate, maxing out a CPU core and eventually crashing with an Out of Memory error when the queue grows too large. The visited check is the only thing standing between BFS and infinite recursion.

## Exercises

1. **Disconnected Graph:** Modify `bfs_distance.cpp` to print a message if a node is completely unreachable (its distance remains `-1` after the BFS completes).
2. **Path to Anywhere:** Move the path reconstruction logic from `bfs_path.cpp` into a dedicated function `std::vector<int> getPath(const std::vector<int>& parent, int target)` that you can call for any target node, not just Node 4.
3. **Implicit Graph BFS:** Imagine a chess knight on a grid. You don't need a `std::vector<std::vector<int>>` graph. Write a BFS where the `for (int neighbor : graph[current])` loop is replaced by generating the 8 valid knight moves on the fly, tracking the shortest number of jumps to a destination square.

## Definition of Done

- [ ] You have compiled and run a standard BFS using `std::queue`.
- [ ] You have observed how a visited set or array prevents infinite cycles.
- [ ] You have run a BFS that computes the shortest path distance to every node.
- [ ] You have reconstructed a step-by-step shortest path using a parent array.
- [ ] You can explain out loud why a queue produces a breadth-first expansion instead of a depth-first one.
