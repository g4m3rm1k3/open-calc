# Lesson 36: Graph Algorithms — DFS and BFS

What you will build: The reader understands graphs as adjacency lists, depth-first search (DFS), breadth-first search (BFS), cycle detection, and shortest path (unweighted). The transferable insight: a graph models pairwise relationships. BFS explores layer by layer (finds shortest path in unweighted graphs). DFS explores as far as possible before backtracking (finds paths, detects cycles, topological sort). Every tree is a graph; not every graph is a tree.

What you need to know first: Lessons 00-35.

**Terms used in this lesson**
- **Graph** — a data structure that models pairwise relationships.
- **Node (Vertex)** — an entity in a graph.
- **Edge** — a connection between two nodes.
- **Adjacency list** — a way to represent a graph where each node maps to a list of its neighbors.
- **Depth-first search (DFS)** — a graph traversal algorithm that explores as far as possible along each branch before backtracking.
- **Breadth-first search (BFS)** — a graph traversal algorithm that explores the neighbor nodes first, before moving to the next level neighbors.
- **Cycle detection** — the process of finding if a graph has any cycles (paths that start and end at the same node).
- **Topological sort** — a linear ordering of vertices such that for every directed edge u->v, vertex u comes before v in the ordering.
- **Directed Acyclic Graph (DAG)** — a directed graph with no directed cycles.

**Objects and methods used**
**`dict`**
- *What it is:* A built-in Python dictionary.
- *Implementation:* `dict` or `{}` syntax.
- *Its use:* To map nodes to their neighbors for the adjacency list.
- *Type:* Built-in class.
- *Responsibility:* Store key-value pairs with O(1) average time complexity for lookups.
- *Depends on:* Keys must be hashable.
- *Connects to:* Holds lists of neighbors as values.
- *Shape:* Core data structure for the graph representation.

**`list`**
- *What it is:* A built-in Python list.
- *Implementation:* `list` or `[]` syntax.
- *Its use:* To store the neighbors of a node or maintain paths and traversal orders.
- *Type:* Built-in class.
- *Responsibility:* Store an ordered collection of items.
- *Depends on:* Nothing.
- *Connects to:* Used within the graph dictionary and traversal algorithms.
- *Shape:* Utility structure.

**`set`**
- *What it is:* A built-in Python set.
- *Implementation:* `set()` syntax.
- *Its use:* To keep track of visited nodes to avoid infinite loops in cyclic graphs.
- *Type:* Built-in class.
- *Responsibility:* Store an unordered collection of unique elements with O(1) average lookup time.
- *Depends on:* Elements must be hashable.
- *Connects to:* Traversal functions.
- *Shape:* Optimization/utility structure.

**`collections.deque`**
- *What it is:* A double-ended queue from the collections module.
- *Implementation:* `deque([iterable])`
- *Its use:* Provides O(1) time complexity for append and pop operations from both ends, used in BFS for the queue.
- *Type:* Standard library class.
- *Responsibility:* Efficient FIFO queue operations.
- *Depends on:* Iterable for initialization.
- *Connects to:* `bfs` function logic.
- *Shape:* Core algorithmic component for BFS.

**`deque.append`**
- *What it is:* Method to add an element to the right side of the deque.
- *Implementation:* `def append(self, x)`
- *Its use:* To add a node to the end of the BFS queue.
- *Type:* Instance method.
- *Responsibility:* Enqueue an element.
- *Depends on:* The deque instance and the element to add.
- *Connects to:* `deque`
- *Shape:* Mutation method.

**`deque.popleft`**
- *What it is:* Method to remove and return an element from the left side of the deque.
- *Implementation:* `def popleft(self)`
- *Its use:* To get the next node to process in BFS (FIFO).
- *Type:* Instance method.
- *Responsibility:* Dequeue an element.
- *Depends on:* The deque instance.
- *Connects to:* `deque`
- *Shape:* Mutation method.

**`list.append`**
- *What it is:* Method to add an element to the end of a list.
- *Implementation:* `def append(self, object)`
- *Its use:* To add elements to the stack or path lists.
- *Type:* Instance method.
- *Responsibility:* Mutate list by adding an item to the end.
- *Depends on:* The list instance and item.
- *Connects to:* `list`
- *Shape:* Mutation method.

**`list.pop`**
- *What it is:* Method to remove and return an element from the end of a list.
- *Implementation:* `def pop(self, index=-1)`
- *Its use:* To implement a stack in iterative DFS (LIFO).
- *Type:* Instance method.
- *Responsibility:* Mutate list by removing the last item and returning it.
- *Depends on:* The list instance.
- *Connects to:* `list`
- *Shape:* Mutation method.

**`set.add`**
- *What it is:* Method to add an element to a set.
- *Implementation:* `def add(self, element)`
- *Its use:* To mark a node as visited.
- *Type:* Instance method.
- *Responsibility:* Mutate set by adding a unique element.
- *Depends on:* The set instance and hashable element.
- *Connects to:* `set`
- *Shape:* Mutation method.

## Concept Unit: Graph representation — adjacency list

### The Problem
How can we represent arbitrary connections between different objects in Python, where one object can connect to multiple others, and relationships might be mutual or one-way?
- What data structure naturally maps a unique key to a collection of related items?
- How would you distinguish between a two-way street and a one-way street using this structure?

### Introduce the concept in isolation
We will use an **adjacency list** represented by a Python dictionary to model these relationships.
```python
isolated_graph = {
    'A': ['B', 'C'],
    'B': ['A']
}
print(isolated_graph['A'])
```
Output:
```
['B', 'C']
```
This proves that mapping a node to a list of its neighbors allows O(1) amortized access to all outgoing edges from any given node.

### Discard the throwaway
The `isolated_graph` throwaway code above is discarded and will not be used in our project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are starting our graph theory implementation.
- **Files affected**: `graph_algorithms.py` (created)
- **Change type**: Add
- **Location**: Top of file
- **Dependencies**: None

### The New Code
```python
# Undirected graph:
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E'],
}

# Directed graph:
digraph = {
    'A': ['B', 'C'],
    'B': ['D'],
    'C': ['D', 'E'],
    'D': ['F'],
    'E': ['F'],
    'F': [],
}
```

### The Updated Project
```python
1: # ← new: Undirected graph:
2: graph = {
3:     'A': ['B', 'C'],
4:     'B': ['A', 'D', 'E'],
5:     'C': ['A', 'F'],
6:     'D': ['B'],
7:     'E': ['B', 'F'],
8:     'F': ['C', 'E'],
9: }
10: 
11: # ← new: Directed graph:
12: digraph = {
13:     'A': ['B', 'C'],
14:     'B': ['D'],
15:     'C': ['D', 'E'],
16:     'D': ['F'],
17:     'E': ['F'],
18:     'F': [],
19: }
```
This establishes our basic test graphs as dictionaries mapping string node names to lists of neighbor node names.

### Mechanical walkthrough
- `graph = { ... }`: Creates a dictionary instance representing the graph.
- `'A': ['B', 'C']`: A key-value pair where the key `'A'` (a string) is a node, and the value `['B', 'C']` (a list) contains its neighbors.
- `digraph = { ... }`: Creates a second dictionary for a directed graph.
- `'F': []`: In the directed graph, node `'F'` has no outgoing edges, so its neighbor list is empty.

### CS lens
**Adjacency List** is a fundamental CS data structure for sparse graphs. It appears in:
1. Social networks (friends lists).
2. Web crawling (links between pages).
3. Package managers (dependencies).

### SE lens
**Data-driven design**. By separating the graph structure into a simple data definition (a dictionary of lists) rather than creating complex `Node` and `Edge` objects, we reduce memory overhead and make the data easy to serialize (e.g., to JSON) or traverse using standard Python idioms. The alternative of rich node objects is harder to construct and traverse safely.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
Nodes: ['A', 'B', 'C', 'D', 'E', 'F']
A's neighbors: ['B', 'C']
Edges: 6
```
Checking neighbors of A: O(degree(A)) = O(1) amortized. Adding edge: O(1). Checking if edge (u,v) exists: O(degree(u)).

### One sentence connecting to previous unit
Now that we have a structure to hold our graph data, we need a way to visit every node in it systematically.

## Concept Unit: Depth-first search (DFS)

### The Problem
If we start at node 'A', how do we visit every connected node exactly once, exploring as deeply as possible before looking at alternative paths?
- What happens if we visit a node that links back to 'A'?
- How do we remember where we've been?

### Introduce the concept in isolation
We will use a **set** to keep track of visited nodes to prevent infinite loops during traversal.
```python
visited = set()
visited.add('A')
print('A' in visited)
```
Output:
```
True
```
This proves that a set provides a fast O(1) way to check if we've already processed a specific node.

### Discard the throwaway
The `visited` throwaway code is discarded and will not be used directly in our project's global scope.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `graph_algorithms.py` (modified)
- **Change type**: Add
- **Location**: Below the graph definitions
- **Dependencies**: The `graph` dictionary defined previously.

### The New Code
```python
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    print(start, end=' ')
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    return visited

def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    order = []
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            order.append(node)
            for neighbor in graph[node]:
                if neighbor not in visited:
                    stack.append(neighbor)
    return order
```

### The Updated Project
```python
...
12: digraph = {
13:     'A': ['B', 'C'],
14:     'B': ['D'],
15:     'C': ['D', 'E'],
16:     'D': ['F'],
17:     'E': ['F'],
18:     'F': [],
19: }
20: 
21: # ← new
22: def dfs(graph, start, visited=None):
23:     if visited is None:
24:         visited = set()
25:     visited.add(start)
26:     print(start, end=' ')
27:     for neighbor in graph[start]:
28:         if neighbor not in visited:
29:             dfs(graph, neighbor, visited)
30:     return visited
31: 
32: # ← new
33: def dfs_iterative(graph, start):
34:     visited = set()
35:     stack = [start]
36:     order = []
37:     while stack:
38:         node = stack.pop()
39:         if node not in visited:
40:             visited.add(node)
41:             order.append(node)
42:             for neighbor in graph[node]:
43:                 if neighbor not in visited:
44:                     stack.append(neighbor)
45:     return order
```
These functions implement Depth-First Search both recursively and iteratively.

### Mechanical walkthrough
- `def dfs(graph, start, visited=None):`: Defines a function taking the graph, start node, and an optional visited set.
- `if visited is None: visited = set()`: Initializes the visited set on the first call.
- `visited.add(start)`: Marks the current node as visited.
- `print(start, end=' ')`: Outputs the node.
- `for neighbor in graph[start]:`: Iterates over the neighbors of the current node.
- `if neighbor not in visited:`: Checks if the neighbor has already been processed.
- `dfs(graph, neighbor, visited)`: Recursively calls DFS on the unvisited neighbor.
- `def dfs_iterative(graph, start):`: Defines the iterative version.
- `stack = [start]`: Uses a list as a stack (LIFO) to track nodes to visit.
- `node = stack.pop()`: Removes and returns the last element added to the stack.
- `stack.append(neighbor)`: Adds unvisited neighbors to the stack to be processed deeply.

### CS lens
**Depth-First Search (DFS)** is a fundamental graph traversal algorithm. It appears in:
1. Solving mazes.
2. Topological sorting.
3. Finding connected components.

### SE lens
**Default mutable arguments pitfall**. We use `visited=None` instead of `visited=set()` in the function signature because default arguments in Python are evaluated once at function definition time. If we used a mutable default like a set, subsequent calls to `dfs` would unexpectedly share the same visited set, causing incorrect behavior.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
DFS from A:
A B D E F C 
DFS iterative: ['A', 'C', 'F', 'E', 'B', 'D']
```
Trace dfs(graph, 'A'): visited={A}. Neighbors: B,C. B not visited: dfs(graph,'B'). visited={A,B}. Neighbors: A,D,E. A visited. D not visited: dfs('D'). visited={A,B,D}. D's neighbors: B. B visited. Return. E not visited: dfs('E'). visited={A,B,D,E}. E's neighbors: B(visited), F. dfs('F'): visited={A,B,D,E,F}. F's neighbors: C,E. dfs('C'). Print order: A B D E F C.

### One sentence connecting to previous unit
While DFS dives deep quickly, sometimes we need to explore nodes closest to us first to find the shortest path, which requires a different approach.

## Concept Unit: Breadth-first search (BFS) — shortest path

### The Problem
If we want to find the shortest path from 'A' to 'F', DFS might take a long winding route. How can we explore all neighbors 1 step away, then 2 steps away, etc.?
- What data structure lets us process nodes in the exact order they were discovered?

### Introduce the concept in isolation
We will use a **queue** (FIFO) implemented via `collections.deque`.
```python
from collections import deque
queue = deque(['A'])
queue.append('B')
print(queue.popleft())
```
Output:
```
A
```
This proves that `deque` allows O(1) removals from the left side, giving us First-In-First-Out behavior.

### Discard the throwaway
The `queue` throwaway code is discarded and will not be used in our project directly.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `graph_algorithms.py` (modified)
- **Change type**: Add
- **Location**: Below DFS definitions
- **Dependencies**: `collections.deque`

### The New Code
```python
from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

def bfs_shortest_path(graph, start, end):
    visited = {start}
    queue = deque([[start]])
    while queue:
        path = queue.popleft()
        node = path[-1]
        if node == end:
            return path
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(path + [neighbor])
    return None
```

### The Updated Project
```python
1: # ← new
2: from collections import deque
3: 
4: # Undirected graph:
...
45:     return order
46: 
47: # ← new
48: def bfs(graph, start):
49:     visited = {start}
50:     queue = deque([start])
51:     order = []
52:     while queue:
53:         node = queue.popleft()
54:         order.append(node)
55:         for neighbor in graph[node]:
56:             if neighbor not in visited:
57:                 visited.add(neighbor)
58:                 queue.append(neighbor)
59:     return order
60: 
61: # ← new
62: def bfs_shortest_path(graph, start, end):
63:     visited = {start}
64:     queue = deque([[start]])
65:     while queue:
66:         path = queue.popleft()
67:         node = path[-1]
68:         if node == end:
69:             return path
70:         for neighbor in graph[node]:
71:             if neighbor not in visited:
72:                 visited.add(neighbor)
73:                 queue.append(path + [neighbor])
74:     return None
```
These functions implement layer-by-layer traversal to find the shortest path in an unweighted graph.

### Mechanical walkthrough
- `from collections import deque`: Imports the double-ended queue.
- `visited = {start}`: Initializes a set with the start node using set literal syntax.
- `queue = deque([start])`: Initializes the queue with the start node.
- `node = queue.popleft()`: Removes and returns the oldest node in the queue (FIFO).
- `queue = deque([[start]])`: In the shortest path version, the queue holds *paths* (lists of nodes), initialized with a path containing just the start node.
- `path = queue.popleft()`: Removes the oldest path.
- `node = path[-1]`: Gets the last node in the current path.
- `queue.append(path + [neighbor])`: Creates a new list by concatenating the current path with the new neighbor, enqueuing the longer path.

### CS lens
**Breadth-First Search (BFS)** is the optimal algorithm for finding the shortest path in unweighted graphs. It appears in:
1. Peer-to-peer network routing.
2. Search engine crawlers finding pages close to a seed URL.
3. Garbage collection algorithms tracing live objects layer by layer.

### SE lens
**Algorithmic selection based on constraints**. We chose BFS here because all edges have equal weight (unweighted). If edges had different weights (like distances or times), BFS would fail to find the shortest path, and we would need a priority queue (Dijkstra's algorithm) instead.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
BFS: ['A', 'B', 'C', 'D', 'E', 'F']
Path A->F: ['A', 'C', 'F']
```
Trace bfs_shortest_path(graph,'A','F'): queue=[[A]]. Pop [A]: node=A, not F. Neighbors B,C. queue=[[A,B],[A,C]]. Pop [A,B]: node=B. Neighbors D,E. queue=[[A,C],[A,B,D],[A,B,E]]. Pop [A,C]: node=C, not F. Neighbor F. queue=[[A,B,D],[A,B,E],[A,C,F]]. Pop [A,B,D]: D, not F. etc. Eventually pop [A,C,F]: node=F==end. Return [A,C,F]. Length 3 -> 2 edges: shortest path.

### One sentence connecting to previous unit
Traversals assume graphs might have cycles; what if we need to explicitly check if a cycle exists?

## Concept Unit: Cycle detection

### The Problem
If a graph has a loop (e.g., A -> B -> A), how can we algorithmically prove its existence?
- When we visit an already-visited node during DFS, is it always a cycle?
- How do we distinguish between an undirected edge back to the node we *just* came from, versus a true cycle?

### Introduce the concept in isolation
We will use a specialized DFS that tracks the **parent** node to identify true back-edges.
```python
def check_visited(node, parent, visited):
    # If the node is visited and it's NOT the parent, we found a loop
    return node in visited and node != parent

visited = {'A', 'B'}
print(check_visited('A', 'B', visited))
```
Output:
```
True
```
This proves that tracking the parent allows us to ignore the trivial loop of an undirected edge (going immediately back where we came from).

### Discard the throwaway
The `check_visited` throwaway code is discarded and will not be used in the final cycle detection algorithm.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `graph_algorithms.py` (modified)
- **Change type**: Add
- **Location**: Below BFS definitions
- **Dependencies**: None

### The New Code
```python
def has_cycle_undirected(graph):
    visited = set()

    def dfs(node, parent):
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:
                return True
        return False

    for node in graph:
        if node not in visited:
            if dfs(node, None):
                return True
    return False
```

### The Updated Project
```python
...
74:     return None
75: 
76: # ← new
77: def has_cycle_undirected(graph):
78:     visited = set()
79: 
80:     def dfs(node, parent):
81:         visited.add(node)
82:         for neighbor in graph[node]:
83:             if neighbor not in visited:
84:                 if dfs(neighbor, node):
85:                     return True
86:             elif neighbor != parent:
87:                 return True
88:         return False
89: 
90:     for node in graph:
91:         if node not in visited:
92:             if dfs(node, None):
93:                 return True
94:     return False
```
This adds a function to verify if an undirected graph contains any cycles.

### Mechanical walkthrough
- `def has_cycle_undirected(graph):`: Defines the outer function holding the shared `visited` state.
- `def dfs(node, parent):`: Defines a nested helper function that can access `visited` from the outer scope via closure.
- `if dfs(neighbor, node): return True`: Recursively explores unvisited neighbors. If any recursive call finds a cycle, the `True` bubbles up immediately.
- `elif neighbor != parent: return True`: If the neighbor *is* visited, and it is *not* the node we just arrived from (`parent`), we have found a cycle.
- `for node in graph:`: The outer loop ensures we check disconnected components of the graph by initiating DFS from any unvisited node.
- `dfs(node, None)`: Starts the DFS for a component. The root has no parent, so `None` is passed.

### CS lens
**Cycle detection** is crucial for ensuring graphs are trees or DAGs. It appears in:
1. Deadlock detection in operating systems.
2. Detecting infinite loops in spreadsheets (circular references).
3. Verifying valid Git commit histories.

### SE lens
**Closures for state encapsulation**. By nesting the `dfs` function inside `has_cycle_undirected`, we avoid having to pass the `visited` set around as a parameter or exposing it as a global variable. The inner function automatically has access to the outer function's scope, simplifying its signature.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
True
False
```
Trace has_cycle_undirected(cyclic): dfs(A, None): visited={A}. Neighbor B: dfs(B,A). visited={A,B}. Neighbor A: A==parent -> skip. Neighbor C: dfs(C,B). visited={A,B,C}. Neighbor A: A!=parent B AND A is visited -> CYCLE. Return True.

### One sentence connecting to previous unit
If a directed graph has no cycles, we can order its nodes linearly to resolve dependencies.

## Concept Unit: Topological sort — DFS on a DAG

### The Problem
Given a set of tasks with dependencies (e.g., 'compile' before 'link', 'link' before 'test'), how do we find a valid execution order?
- What happens if we just list nodes as we encounter them in DFS?
- Why do we need to know all of a node's dependencies have been met before adding it?

### Introduce the concept in isolation
We will use **post-order appending and reversal** to build the sorted list.
```python
result = []
result.append('compile')
result.append('link')
print(result[::-1])
```
Output:
```
['link', 'compile']
```
This proves that by appending elements *after* processing their dependencies, and then reversing the list with the `[::-1]` slice, we get a valid topological order.

### Discard the throwaway
The `result` throwaway code is discarded.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `graph_algorithms.py` (modified)
- **Change type**: Add
- **Location**: Bottom of the file
- **Dependencies**: None

### The New Code
```python
def topological_sort(graph):
    '''Graph must be a DAG (directed acyclic graph).'''
    visited = set()
    result = []

    def dfs(node):
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs(neighbor)
        result.append(node)

    for node in graph:
        if node not in visited:
            dfs(node)

    return result[::-1]
```

### The Updated Project
```python
...
94:     return False
95: 
96: # ← new
97: def topological_sort(graph):
98:     '''Graph must be a DAG (directed acyclic graph).'''
99:     visited = set()
100:     result = []
101: 
102:     def dfs(node):
103:         visited.add(node)
104:         for neighbor in graph[node]:
105:             if neighbor not in visited:
106:                 dfs(neighbor)
107:         result.append(node)
108: 
109:     for node in graph:
110:         if node not in visited:
111:             dfs(node)
112: 
113:     return result[::-1]
```
This algorithm provides a valid ordering for tasks with dependencies in a directed acyclic graph.

### Mechanical walkthrough
- `def topological_sort(graph):`: Defines the sorting function.
- `'''Graph must be a DAG...'''`: Docstring indicating the algorithm's prerequisite.
- `result = []`: Initializes the list to hold the sorted nodes.
- `dfs(node)`: Recursive helper function.
- `result.append(node)`: This is the key insight. We add the node to our result *only after* all of its descendants (dependencies) have been fully explored and added.
- `for node in graph:`: Outer loop ensures we don't miss nodes with no incoming edges.
- `return result[::-1]`: Returns the reversed list. Since nodes were appended post-order (dependents before dependencies), reversing it puts dependencies first.

### CS lens
**Topological Sort** is the standard algorithm for dependency resolution. It appears in:
1. Build systems (Make, Ninja) ordering compilation tasks.
2. Package managers resolving install orders.
3. Scheduling systems.

### SE lens
**Preconditions and docstrings**. We document that the graph *must* be a DAG. If we ran this on a cyclic graph, the result would be invalid or it might silently loop indefinitely without a visited check. Production implementations often combine cycle detection with topological sort to throw a descriptive exception if a cycle is found.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
['assets', 'compile', 'link', 'test', 'deploy']
```
Trace topo_sort: dfs('compile'): visit compile, then dfs('link'): visit link, dfs('test'): visit test, dfs('deploy'): visit deploy, no neighbors, append 'deploy'. append 'test'. append 'link'. append 'compile'. dfs('assets'): dfs('deploy') already visited, append 'assets'. result=['deploy','test','link','compile','assets']. Reversed: ['assets','compile','link','test','deploy'].

### One sentence connecting to previous unit
We've now seen how to represent a graph, explore its depths, find its shortest paths, detect its cycles, and order its dependencies.

## Closing

### Connect the pieces
Graph algorithms unify under the idea of systematic traversal. Whether diving deep with DFS or exploring layers with BFS, the core mechanics rely on marking visited states to avoid loops.
Trace BFS finding shortest path A->F in the sample graph through all concepts:
- **Unit 1 (Representation)**: The graph is defined as a dictionary `{'A':['B','C'], ... 'F':['C','E']}`.
- **Unit 2 (DFS)**: We learned how a `visited` set prevents us from revisiting 'A' when we look at 'B'.
- **Unit 3 (BFS)**: `bfs_shortest_path` begins with a queue containing `[[A]]`.
  - Pop `[A]`. Node 'A' is not 'F'. Neighbors are 'B' and 'C'. New paths `[A, B]` and `[A, C]` are enqueued.
  - Queue is `[[A, B], [A, C]]`. Pop `[A, B]`. Node 'B' is not 'F'. Neighbors 'D', 'E'. New paths `[A, B, D]` and `[A, B, E]`.
  - Queue is `[[A, C], [A, B, D], [A, B, E]]`. Pop `[A, C]`. Node 'C' is not 'F'. Neighbor 'F' (because 'A' is visited). New path `[A, C, F]`.
  - Queue is `[[A, B, D], [A, B, E], [A, C, F]]`.
  - Pop `[A, B, D]`. Skip 'D'. Pop `[A, B, E]`. Skip 'E'.
  - Pop `[A, C, F]`. The last node is 'F'. We found the destination!
  - Return `['A', 'C', 'F']`. The shortest path length is guaranteed because BFS checks all length-1 paths, then length-2 paths, in strict order.
- **Unit 4 (Cycle detection)**: We see that ignoring the 'visited' check would cause BFS to loop indefinitely between 'A' and 'C'.
- **Unit 5 (Topo Sort)**: While topo sort uses DFS, BFS pathfinding similarly requires understanding how nodes flow directionally (or bidirectionally) to resolve the correct sequence of steps.
