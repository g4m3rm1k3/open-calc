# Lesson 36: Graph Algorithms — DFS and BFS

The reader will represent graphs using adjacency lists (dicts), implement depth-first search (DFS) and breadth-first search (BFS), and find shortest paths. The transferable problems: (1) a graph is the right data structure for ANY problem involving relationships or connections: social networks, route planning, dependency resolution, web crawling; (2) DFS explores as deeply as possible before backtracking (uses a stack or recursion); BFS explores level by level (uses a queue) and finds shortest paths in unweighted graphs; (3) representing a graph as an adjacency list (dict mapping node to list of neighbors) is almost always the right choice.

**What you need to know first:**
- Lessons 0–35 (full curriculum through knapsack).

**Terms used in this lesson:**
- **Node (Vertex)** — A single entity or point in a graph. Nodes represent the objects being connected, such as cities, users, or tasks.
- **Edge** — A connection between two nodes in a graph. Edges represent the relationships or paths between the objects.
- **Directed Graph** — A graph where edges have a direction, meaning the connection goes from one node to another, but not necessarily back.
- **Undirected Graph** — A graph where edges are bidirectional; if Node A is connected to Node B, then Node B is also connected to Node A.
- **Weighted Graph** — A graph where edges have a value or "weight" associated with them, often representing cost, distance, or time.
- **Unweighted Graph** — A graph where edges do not have weights; all connections are considered equal.
- **Path** — A sequence of nodes connected by edges, showing a route from a starting node to an ending node.
- **Cycle** — A path in a graph that starts and ends at the same node, meaning you can travel in a loop.
- **Connected Graph** — A graph where there is a path between every pair of nodes.
- **Disconnected Graph** — A graph where some nodes cannot be reached from others.
- **Adjacency List** — A way to represent a graph where each node is mapped to a list of its neighbors. It optimizes space for sparse graphs.
- **Time Complexity: O(V + E)** — The execution time grows linearly with the number of vertices (nodes) and edges.
- **Space Complexity: O(V)** — The memory required grows linearly with the number of vertices.
- **LIFO (Last-In-First-Out)** — The processing order of a stack, where the most recently added item is the first one removed.
- **FIFO (First-In-First-Out)** — The processing order of a queue, where the first item added is the first one removed.
- **Stack Overflow** — An error that occurs when a program runs out of memory in the call stack, often due to excessively deep recursion.
- **DAG (Directed Acyclic Graph)** — A directed graph with no cycles, often used to model dependencies.

**Objects and methods used:**
- **`dict`**
  - *What it is:* A built-in mapping type in Python that associates unique keys with values.
  - *Implementation:* `class dict(**kwargs)`
  - *Its use:* Used as the foundation for the adjacency list to map a node to its list of neighbors.
  - *Type:* Built-in class.
  - *Responsibility:* Maintains a dynamic collection of key-value pairs with fast lookups.
  - *Depends on:* Hashable keys.
  - *Connects to:* Provides values (neighbor lists) when queried with a key (node).
  - *Shape:* A core data structure in memory.
- **`list`**
  - *What it is:* A built-in mutable sequence type in Python.
  - *Implementation:* `class list([iterable])`
  - *Its use:* Used to store the neighbors of each node, the order of visited nodes, and stack operations.
  - *Type:* Built-in class.
  - *Responsibility:* Maintains an ordered collection of items.
  - *Depends on:* Available memory.
  - *Connects to:* Interacts with loops and appending operations.
  - *Shape:* A core array-based sequence in memory.
- **`set`**
  - *What it is:* A built-in mutable collection of distinct hashable items.
  - *Implementation:* `class set([iterable])`
  - *Its use:* Used to keep track of visited nodes to prevent processing a node more than once and avoid infinite loops.
  - *Type:* Built-in class.
  - *Responsibility:* Maintains an unordered collection of unique elements with O(1) membership testing.
  - *Depends on:* Hashable elements.
  - *Connects to:* Queried for membership using the `in` operator.
  - *Shape:* A core hash-table-based collection in memory.
- **`collections.deque`**
  - *What it is:* A double-ended queue that supports thread-safe, memory-efficient appends and pops from either side.
  - *Implementation:* `class collections.deque([iterable[, maxlen]])`
  - *Its use:* Used as the queue for Breadth-First Search to allow O(1) removals from the front.
  - *Type:* Standard library class.
  - *Responsibility:* Provides a linear collection that supports fast additions and removals from both ends.
  - *Depends on:* The `collections` module.
  - *Connects to:* Used in BFS to schedule nodes for future processing.
  - *Shape:* A doubly-linked list structure.
- **`deque.popleft`**
  - *What it is:* A method that removes and returns an element from the left side of the deque.
  - *Implementation:* `def popleft(self): ...`
  - *Its use:* Used in BFS to dequeue the next node to process in FIFO order.
  - *Type:* Instance method of `collections.deque`.
  - *Responsibility:* Removes the oldest item from the queue and returns it.
  - *Depends on:* A non-empty deque instance.
  - *Connects to:* Modifies the deque and provides the node to the BFS loop.
  - *Shape:* A state-mutating access method.
- **`deque.append`**
  - *What it is:* A method that adds an element to the right side of the deque.
  - *Implementation:* `def append(self, x): ...`
  - *Its use:* Used in BFS to enqueue a newly discovered neighbor.
  - *Type:* Instance method of `collections.deque`.
  - *Responsibility:* Adds a new item to the end of the queue.
  - *Depends on:* A deque instance and an item.
  - *Connects to:* Mutates the deque by extending it.
  - *Shape:* A state-mutating modification method.
- **`list.append`**
  - *What it is:* A method that adds an element to the end of a list.
  - *Implementation:* `def append(self, object): ...`
  - *Its use:* Used to add nodes to our results `order` list and push to our stack in DFS.
  - *Type:* Instance method of `list`.
  - *Responsibility:* Grows the list by one element at the end.
  - *Depends on:* A list instance and an item.
  - *Connects to:* Modifies the list in place.
  - *Shape:* A state-mutating modification method.
- **`list.pop`**
  - *What it is:* A method that removes and returns an element at a given index (defaulting to the last item).
  - *Implementation:* `def pop(self, index=-1): ...`
  - *Its use:* Used in DFS to treat the list as a stack by popping the most recently added node (LIFO).
  - *Type:* Instance method of `list`.
  - *Responsibility:* Removes and returns the top item of the stack.
  - *Depends on:* A non-empty list instance.
  - *Connects to:* Modifies the list and provides the node to the DFS loop.
  - *Shape:* A state-mutating access method.
- **`set.add`**
  - *What it is:* A method that adds a single element to a set.
  - *Implementation:* `def add(self, element): ...`
  - *Its use:* Used to mark a node as visited by adding it to the `visited` set.
  - *Type:* Instance method of `set`.
  - *Responsibility:* Ensures the element is present in the set.
  - *Depends on:* A set instance and a hashable element.
  - *Connects to:* Modifies the set in place.
  - *Shape:* A state-mutating modification method.


## Concept Unit: Graph Terminology and Representation

### The Problem
When dealing with interconnected data like social networks or maps, how do we formally represent the connections in a way that a program can efficiently traverse?

### Isolate the Concept
We isolate the idea of a "dictionary of lists" to map relationships. Let's create a small throwaway script to see how it works.

```python
lab_dict = {
    'Alice': ['Bob', 'Charlie'],
    'Bob': ['Alice']
}
print(lab_dict['Alice'])
```

Output:
```text
['Bob', 'Charlie']
```

This simple dictionary lookup proves that we can instantly retrieve all related entities for a given key. This structure is called an **Adjacency List**.

### Discard the throwaway example
The simple `lab_dict` script is now discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are starting our graph representations.
- **Files affected**: `graph_models.py` (created)
- **Change type**: add
- **Location**: Top of file.
- **Dependencies**: None.

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

# Directed graph (one-way edges):
directed = {
    'A': ['B', 'C'],
    'B': ['D'],
    'C': ['D', 'E'],
    'D': [],
    'E': ['D'],
}

print(f'Nodes: {list(graph.keys())}')
print(f'A neighbors: {graph["A"]}')
print(f'Edges from A: {len(graph["A"])}')
```

### The Updated Project
```python
# 1: # Undirected graph:
# 2: graph = {
# 3:     'A': ['B', 'C'],
# 4:     'B': ['A', 'D', 'E'],
# 5:     'C': ['A', 'F'],
# 6:     'D': ['B'],
# 7:     'E': ['B', 'F'],
# 8:     'F': ['C', 'E'],
# 9: }
# 10: 
# 11: # Directed graph (one-way edges):
# 12: directed = {
# 13:     'A': ['B', 'C'],
# 14:     'B': ['D'],
# 15:     'C': ['D', 'E'],
# 16:     'D': [],
# 17:     'E': ['D'],
# 18: }
# 19: 
# 20: print(f'Nodes: {list(graph.keys())}')
# 21: print(f'A neighbors: {graph["A"]}')
# 22: print(f'Edges from A: {len(graph["A"])}')
```
Output:
```text
Nodes: ['A', 'B', 'C', 'D', 'E', 'F']
A neighbors: ['B', 'C']
Edges from A: 2
```

We have established two foundational dictionaries mapping nodes to edges.

### Mechanical walkthrough
- **`graph = { ... }`**: We declare a dictionary literal. A `dict` is a built-in mapping type in Python that associates unique keys with values. Here, the keys are node names (`'A'`), and the values are lists of connected nodes.
- **`['B', 'C']`**: We declare a list literal. A `list` is a built-in mutable sequence type in Python. This list represents the neighbors of node 'A'.
- **`directed = { ... }`**: We declare a second dictionary. In a directed graph, edges only go one way (e.g., 'B' points to 'D', but 'D' points to nothing).
- **`list(graph.keys())`**: We extract the dictionary keys and cast them to a `list`. The `keys()` method of `dict` returns a view object, which we convert to a list to print the nodes.
- **`graph["A"]`**: We look up the key `'A'` in the dictionary. It instantly returns the mapped list `['B', 'C']`.
- **`len(...)`**: We call the built-in `len` function on the retrieved list. It returns `2`, proving that node A has 2 outgoing edges.


## Concept Unit: Depth-First Search (DFS) — iterative

### The Problem
How do we systematically visit every connected node in a graph without going in circles?

### Isolate the Concept
We isolate the concept of using a stack and a visited set to avoid loops.

```python
lab_stack = [1]
lab_visited = set()

while lab_stack:
    item = lab_stack.pop()
    if item not in lab_visited:
        lab_visited.add(item)
        print(item)
        if item == 1:
            lab_stack.append(2)
            lab_stack.append(1) # Intentional loop attempt
```

Output:
```text
1
2
```

This proves that even if we push an item to the stack multiple times, the `visited` set prevents us from processing it endlessly. This pattern is **Iterative Depth-First Search**.

### Discard the throwaway example
The stack lab script is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `graph_search.py` (created)
- **Change type**: add
- **Location**: Top of file.
- **Dependencies**: The `graph` dictionary from the previous step.

### The New Code
```python
def dfs(graph, start):
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

graph = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [], 'E': [], 'F': []
}
print(dfs(graph, 'A'))
```

### The Updated Project
```python
# 1: def dfs(graph, start):
# 2:     visited = set()
# 3:     stack = [start]
# 4:     order = []
# 5:     while stack:
# 6:         node = stack.pop()
# 7:         if node not in visited:
# 8:             visited.add(node)
# 9:             order.append(node)
# 10:             for neighbor in graph[node]:
# 11:                 if neighbor not in visited:
# 12:                     stack.append(neighbor)
# 13:     return order
# 14: 
# 15: graph = {
# 16:     'A': ['B', 'C'],
# 17:     'B': ['D', 'E'],
# 18:     'C': ['F'],
# 19:     'D': [], 'E': [], 'F': []
# 20: }
# 21: print(dfs(graph, 'A'))
```
Output:
```text
['A', 'C', 'F', 'B', 'E', 'D']
```
We have a fully working DFS traversal. It visits one full branch before backtracking.

### Mechanical walkthrough
- **`visited = set()`**: We instantiate an empty `set`. A `set` is a mutable collection of distinct items, providing O(1) lookups to determine if we've seen a node before.
- **`stack = [start]`**: We instantiate a `list` with one element. We treat this list as a stack (Last-In-First-Out).
- **`order = []`**: We instantiate an empty `list` to record the sequence of our traversal.
- **`while stack:`**: We loop as long as there are items in the stack.
- **`node = stack.pop()`**: We call `list.pop`. It removes and returns the last element of the list. This is the LIFO behavior that makes this a depth-first search.
- **`if node not in visited:`**: We use the `in` operator to check membership in our `set`.
- **`visited.add(node)`**: We call `set.add` to mark this node so we don't visit it again.
- **`order.append(node)`**: We call `list.append` to record that we've visited this node.
- **`for neighbor in graph[node]:`**: We iterate through the list of neighbors for this node.
- **`if neighbor not in visited:`**: We check the set again.
- **`stack.append(neighbor)`**: We call `list.append` on our stack list to schedule this neighbor for future visits.


## Concept Unit: Depth-First Search — recursive

### The Problem
Can we write DFS without manually managing a stack list, letting the language's own call stack handle the depth tracking?

### Isolate the Concept
We isolate recursive traversal on a small structure.

```python
def lab_recursive(n, visited):
    if n not in visited:
        visited.add(n)
        print(n)
        if n < 3:
            lab_recursive(n + 1, visited)

lab_recursive(1, set())
```

Output:
```text
1
2
3
```

This proves that recursion intrinsically goes deep before returning. This pattern is **Recursive Depth-First Search**.

### Discard the throwaway example
The recursion lab script is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `graph_search.py`
- **Change type**: add
- **Location**: Below the `dfs` function.
- **Dependencies**: The `graph` dictionary.

### The New Code
```python
def dfs_recursive(graph, node, visited=None, order=None):
    if visited is None:
        visited = set()
        order = []
    visited.add(node)
    order.append(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited, order)
    return order

print(dfs_recursive(graph, 'A'))
```

### The Updated Project
```python
# 1: def dfs_recursive(graph, node, visited=None, order=None):
# 2:     if visited is None:
# 3:         visited = set()
# 4:         order = []
# 5:     visited.add(node)
# 6:     order.append(node)
# 7:     for neighbor in graph[node]:
# 8:         if neighbor not in visited:
# 9:             dfs_recursive(graph, neighbor, visited, order)
# 10:     return order
# 11: 
# 12: print(dfs_recursive(graph, 'A'))
```
Output:
```text
['A', 'B', 'D', 'E', 'C', 'F']
```
We implemented the same traversal conceptually, but the language call stack handles the LIFO behavior. Note the order differs slightly due to how neighbors are processed.

### Mechanical walkthrough
- **`def dfs_recursive(..., visited=None, order=None):`**: We define optional parameters. We use `None` rather than mutable defaults like `[]` or `set()` because mutable default arguments in Python are evaluated once at definition time, not on every call.
- **`if visited is None:`**: We initialize our `set` and `list` on the first call.
- **`visited.add(node)`**: We call `set.add` to mark the node.
- **`order.append(node)`**: We call `list.append` to record it.
- **`for neighbor in graph[node]:`**: We iterate through the neighbors.
- **`dfs_recursive(...)`**: We call the function from within itself, pausing the current execution and going deeper into the next node.


## Concept Unit: Breadth-First Search (BFS) — finds shortest paths

### The Problem
What if we want to explore a graph evenly in concentric circles — all neighbors first, then their neighbors — to guarantee we find the shortest path?

### Isolate the Concept
We isolate the concept of a double-ended queue.

```python
from collections import deque
lab_q = deque([1])
lab_q.append(2)
print(lab_q.popleft())
```

Output:
```text
1
```

This proves we can efficiently pop from the front of the sequence, ensuring First-In-First-Out processing. This pattern is **Breadth-First Search**.

### Discard the throwaway example
The deque lab script is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `graph_search.py`
- **Change type**: add
- **Location**: Top of file (import) and below `dfs_recursive`.
- **Dependencies**: The `graph` dictionary.

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

print(bfs(graph, 'A'))
```

### The Updated Project
```python
# 1: from collections import deque
# 2: 
# 3: def bfs(graph, start):
# 4:     visited = {start}
# 5:     queue = deque([start])
# 6:     order = []
# 7:     while queue:
# 8:         node = queue.popleft()
# 9:         order.append(node)
# 10:         for neighbor in graph[node]:
# 11:             if neighbor not in visited:
# 12:                 visited.add(neighbor)
# 13:                 queue.append(neighbor)
# 14:     return order
# 15: 
# 16: print(bfs(graph, 'A'))
```
Output:
```text
['A', 'B', 'C', 'D', 'E', 'F']
```
BFS visits all distance-1 nodes (B, C) before moving to distance-2 nodes (D, E, F).

### Mechanical walkthrough
- **`from collections import deque`**: We import `deque`. `collections.deque` is a double-ended queue that allows O(1) append/popleft, whereas `list.pop(0)` is O(n).
- **`visited = {start}`**: We initialize a `set` with the start node already inside using set literal syntax.
- **`queue = deque([start])`**: We initialize our `deque` with the start node.
- **`node = queue.popleft()`**: We call `deque.popleft`. It removes and returns the first element, treating the collection as a FIFO queue.
- **`visited.add(neighbor)`**: We call `set.add` on discovery, rather than at pop time, to prevent putting the same node in the queue multiple times.
- **`queue.append(neighbor)`**: We call `deque.append` to put the newly discovered neighbor at the end of the line.


## Concept Unit: BFS shortest path

### The Problem
BFS guarantees the shortest path, but how do we reconstruct that exact sequence of nodes if we only stored individual nodes in the queue?

### Isolate the Concept
We isolate storing full sequences instead of scalar values in our collection.

```python
lab_q2 = [[1]]
current_path = lab_q2.pop(0)
new_path = current_path + [2]
print(new_path)
```

Output:
```text
[1, 2]
```

This proves we can enqueue paths (lists) rather than just nodes, allowing us to carry the traversal history with us.

### Discard the throwaway example
The list-appending lab is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `graph_search.py`
- **Change type**: add
- **Location**: Below `bfs`.
- **Dependencies**: `collections.deque`.

### The New Code
```python
def bfs_shortest_path(graph, start, end):
    if start == end:
        return [start]
    visited = {start}
    queue = deque([[start]])
    while queue:
        path = queue.popleft()
        node = path[-1]
        for neighbor in graph[node]:
            if neighbor not in visited:
                new_path = path + [neighbor]
                if neighbor == end:
                    return new_path
                visited.add(neighbor)
                queue.append(new_path)
    return None

graph2 = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [], 'E': ['F'], 'F': []
}
print(bfs_shortest_path(graph2, 'A', 'F'))
print(bfs_shortest_path(graph2, 'A', 'D'))
```

### The Updated Project
```python
# 1: def bfs_shortest_path(graph, start, end):
# 2:     if start == end:
# 3:         return [start]
# 4:     visited = {start}
# 5:     queue = deque([[start]])
# 6:     while queue:
# 7:         path = queue.popleft()
# 8:         node = path[-1]
# 9:         for neighbor in graph[node]:
# 10:             if neighbor not in visited:
# 11:                 new_path = path + [neighbor]
# 12:                 if neighbor == end:
# 13:                     return new_path
# 14:                 visited.add(neighbor)
# 15:                 queue.append(new_path)
# 16:     return None
# 17: 
# 18: graph2 = {
# 19:     'A': ['B', 'C'],
# 20:     'B': ['D', 'E'],
# 21:     'C': ['F'],
# 22:     'D': [], 'E': ['F'], 'F': []
# 23: }
# 24: print(bfs_shortest_path(graph2, 'A', 'F'))
# 25: print(bfs_shortest_path(graph2, 'A', 'D'))
```
Output:
```text
['A', 'C', 'F']
['A', 'B', 'D']
```
Instead of finding if a node is connected, we return the shortest physical sequence of edges between them.

### Mechanical walkthrough
- **`queue = deque([[start]])`**: We wrap our `start` node in a `list` inside the `deque`. The queue now holds paths (lists of nodes), not individual nodes.
- **`path = queue.popleft()`**: We dequeue a full path list.
- **`node = path[-1]`**: We use list slicing `[-1]` to get the last element in the path list, which is the current node we are exploring.
- **`new_path = path + [neighbor]`**: We use the `+` operator to concatenate two lists, creating a brand new list that includes the neighbor, preserving the history.
- **`if neighbor == end:`**: If this neighbor is our target, we immediately return `new_path` because BFS guarantees the first time we see a node, it's via the shortest path.
- **`queue.append(new_path)`**: We enqueue the new list so we can build off of it in the future.


## Concept Unit: Detecting cycles

### The Problem
How can we definitively say if a directed graph contains a loop (a back edge)?

### Isolate the Concept
We isolate coloring states using an integer mapping.

```python
colors = {'A': 0}
colors['A'] = 1  # visiting
if colors['A'] == 1:
    print("Found active node")
colors['A'] = 2  # done
```

Output:
```text
Found active node
```

This proves we can track multiple explicit states (unvisited, visiting, done) beyond a simple binary visited/unvisited set.

### Discard the throwaway example
The coloring lab script is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `graph_search.py`
- **Change type**: add
- **Location**: Bottom of file.
- **Dependencies**: None.

### The New Code
```python
def has_cycle_directed(graph):
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in graph}

    def dfs(node):
        color[node] = GRAY
        for neighbor in graph[node]:
            if color[neighbor] == GRAY:
                return True
            if color[neighbor] == WHITE:
                if dfs(neighbor):
                    return True
        color[node] = BLACK
        return False

    return any(dfs(node) for node in graph if color[node] == WHITE)

no_cycle = {'A': ['B'], 'B': ['C'], 'C': []}
has_cycle = {'A': ['B'], 'B': ['C'], 'C': ['A']}
print(has_cycle_directed(no_cycle))
print(has_cycle_directed(has_cycle))
```

### The Updated Project
```python
# 1: def has_cycle_directed(graph):
# 2:     WHITE, GRAY, BLACK = 0, 1, 2
# 3:     color = {node: WHITE for node in graph}
# 4: 
# 5:     def dfs(node):
# 6:         color[node] = GRAY
# 7:         for neighbor in graph[node]:
# 8:             if color[neighbor] == GRAY:
# 9:                 return True
# 10:             if color[neighbor] == WHITE:
# 11:                 if dfs(neighbor):
# 12:                     return True
# 13:         color[node] = BLACK
# 14:         return False
# 15: 
# 16:     return any(dfs(node) for node in graph if color[node] == WHITE)
# 17: 
# 18: no_cycle = {'A': ['B'], 'B': ['C'], 'C': []}
# 19: has_cycle = {'A': ['B'], 'B': ['C'], 'C': ['A']}
# 20: print(has_cycle_directed(no_cycle))
# 21: print(has_cycle_directed(has_cycle))
```
Output:
```text
False
True
```
We successfully detect loops in a directed graph using a three-color DFS approach.

### Mechanical walkthrough
- **`WHITE, GRAY, BLACK = 0, 1, 2`**: We unpack integers into variables acting as constants to represent our three states (unvisited, in-progress, fully processed).
- **`color = {node: WHITE for node in graph}`**: We use a dictionary comprehension to initialize all nodes to `WHITE`.
- **`def dfs(node):`**: We define an inner helper function that captures the `color` dictionary and `graph` from the outer scope via a closure.
- **`color[node] = GRAY`**: We mark the node as currently in the call stack.
- **`if color[neighbor] == GRAY:`**: If a neighbor is `GRAY`, it means we encountered a node that is already on our current path traversal stack — this is a back edge, proving a cycle exists.
- **`color[node] = BLACK`**: We mark the node fully processed once all its neighbors are exhausted.
- **`any(...)`**: The built-in `any` function iterates through a generator expression, returning `True` if any element evaluates to True. It short-circuits on the first `True`.


## Concept Unit: Real-world application — dependency resolution (topological sort)

### The Problem
Given a set of tasks where some must run before others (dependencies), how do we produce a valid execution order?

### Isolate the Concept
We isolate postfix appending during recursion.

```python
lab_res = []
def lab_post(n):
    if n > 0:
        lab_post(n - 1)
    lab_res.append(n)
lab_post(2)
print(lab_res)
```

Output:
```text
[0, 1, 2]
```

This proves that operations occurring *after* a recursive call resolve in bottom-up order. This is the foundation of **Topological Sorting**.

### Discard the throwaway example
The postfix lab script is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `graph_search.py`
- **Change type**: add
- **Location**: Bottom of file.
- **Dependencies**: None.

### The New Code
```python
def topological_sort(graph):
    visited = set()
    order = []

    def dfs(node):
        visited.add(node)
        for dep in graph[node]:
            if dep not in visited:
                dfs(dep)
        order.append(node)

    for node in graph:
        if node not in visited:
            dfs(node)
    return list(reversed(order))

deps = {
    'install_A': ['install_B', 'install_C'],
    'install_B': ['install_D'],
    'install_C': ['install_D'],
    'install_D': [],
}
print(topological_sort(deps))
```

### The Updated Project
```python
# 1: def topological_sort(graph):
# 2:     visited = set()
# 3:     order = []
# 4: 
# 5:     def dfs(node):
# 6:         visited.add(node)
# 7:         for dep in graph[node]:
# 8:             if dep not in visited:
# 9:                 dfs(dep)
# 10:         order.append(node)
# 11: 
# 12:     for node in graph:
# 13:         if node not in visited:
# 14:             dfs(node)
# 15:     return list(reversed(order))
# 16: 
# 17: deps = {
# 18:     'install_A': ['install_B', 'install_C'],
# 19:     'install_B': ['install_D'],
# 20:     'install_C': ['install_D'],
# 21:     'install_D': [],
# 22: }
# 23: print(topological_sort(deps))
```
Output:
```text
['install_D', 'install_B', 'install_C', 'install_A']
```
This algorithm outputs a valid sequence to install the packages such that dependencies are met first. (Note: Output order of peers may vary based on dictionary key order iteration).

### Mechanical walkthrough
- **`visited = set()` and `order = []`**: We initialize tracking collections, captured by the inner function.
- **`dfs(dep)`**: We recursively call DFS on each dependency before moving forward.
- **`order.append(node)`**: Crucially, we call `list.append` *after* all recursive `dfs(dep)` calls have finished. This means a node is only added to the list after all its prerequisites are satisfied.
- **`for node in graph:`**: We iterate over all nodes because a graph might have disconnected components (tasks with completely independent dependency trees).
- **`reversed(order)`**: The built-in `reversed` function takes our bottom-up list and flips it. If our dependencies point from A -> B (A depends on B), then appending after visitation puts A at the end. Reversing it gives us an array where independent tasks are first, but the topological sort can be framed differently depending on edge direction.
- **`list(...)`**: We cast the reversed iterator back into a list to return it.

---

Graphs are one of the most versatile data structures. Lesson 37 introduces randomness. Exercises: implement DFS to find ALL paths between two nodes; implement a function that checks if a graph is bipartite using BFS coloring; implement Dijkstra's shortest path for a weighted graph.
