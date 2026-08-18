# Lesson 13: Graph Fundamentals

**What you will build:** You will write isolated console programs that map out relationships between data points, creating networks of connected information. The transferable problem this solves is choosing the correct memory layout—matrix versus list—to represent sparse versus dense connections while balancing lookup speed against memory consumption.

**What you need to know first:** C++ From Scratch series (Lesson 12 Standard Library Containers) and DSA Lessons 01–02.

**Terms used in this lesson:**
- **Vertex (Node)** — A single data point or entity in a graph. *Why it exists:* To represent the discrete objects (like cities, users, or servers) that make up a network.
- **Edge** — A connection between two vertices. *Why it exists:* To formalize the relationship or path between entities, allowing traversal from one to another.
- **Directed Graph** — A graph where edges have a specific direction (A points to B, but B does not inherently point to A). *Why it exists:* To model asymmetric relationships like one-way streets, followers on social media, or dependencies.
- **Undirected Graph** — A graph where edges are bidirectional (A connects to B, which means B connects to A). *Why it exists:* To model symmetric relationships like physical proximity or mutual friendships.
- **Weight** — A numerical value assigned to an edge. *Why it exists:* To quantify the cost, distance, or capacity of moving across that specific connection.
- **Adjacency Matrix** — A two-dimensional grid representing a graph, where a row and column intersection indicates an edge. *Why it exists:* To provide instant, constant-time checks of whether a connection exists between any two specific vertices.
- **Adjacency List** — A collection where each vertex stores only a list of its actual neighbors. *Why it exists:* To save memory in graphs where most vertices are not connected to every other vertex, avoiding the massive blank space of a matrix.

**Objects and methods used:**
- **`std::vector<T>` / `push_back`**
  - *What it is:* A dynamic, resizable array.
  - *Implementation:* `void push_back(const T& value);`
  - *Its use:* To hold lists of vertices or edges that can grow at runtime without manual memory allocation.
- **`std::unordered_map<Key, T>` / `[]` operator**
  - *What it is:* A collection of key-value pairs stored via hashing, providing constant-time lookups.
  - *Implementation:* `T& operator[](const Key& key);`
  - *Its use:* To map arbitrary identifiers (like strings) to their respective lists of neighbors without requiring contiguous integer IDs.

**Everything else in the file, not this lesson's subject but still explained:**
- **`std::vector<std::vector<T>>`**
  - *What it is:* A vector where each element is itself a vector.
  - *Implementation:* `std::vector<std::vector<int>> matrix;`
  - *Its use:* To create a two-dimensional grid layout in memory.

---

## Concept Unit: Adjacency Matrix

### The Problem
You need to represent a network of items and track exactly which items connect to each other. Storing flat variables like `int vertex1 = 0;` does not capture the relationships between them. You need a data structure that maps pairs of elements to a boolean state: connected or not.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    int numVertices = 3;
    
    std::vector<std::vector<int>> matrix(numVertices, std::vector<int>(numVertices, 0));
    
    matrix[0][1] = 1;
    
    matrix[1][2] = 1;
    matrix[2][1] = 1;
    
    if (matrix[0][1] == 1) {
        std::cout << "Directed edge exists from 0 to 1\n";
    }
    
    if (matrix[1][2] == 1 && matrix[2][1] == 1) {
        std::cout << "Undirected edge exists between 1 and 2\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>`: Includes the standard library file required for console output.
- `#include <vector>`: Instructs the compiler to include the definition for the `std::vector` template.
- `int numVertices = 3;`: Declares an integer specifying the total number of vertices in our graph (indexed 0, 1, and 2).
- `std::vector<std::vector<int>> matrix`: Declares a nested vector. The outer vector holds rows, and each row is an inner vector of integers.
- `(numVertices, std::vector<int>(numVertices, 0))`: The constructor arguments. The outer vector is sized to `numVertices` rows. Every row is initialized with a brand new `std::vector<int>` that contains `numVertices` elements, all initialized to `0`. This builds a perfect 3x3 square grid.
- `matrix[0][1] = 1;`: The first `[0]` accesses the zeroth row, acting as the starting vertex. The second `[1]` accesses the first element inside that row, acting as the destination vertex. Assigning `1` physically records an edge from 0 to 1. Because `matrix[1][0]` remains 0, this is a **directed graph** relationship.
- `matrix[1][2] = 1;` and `matrix[2][1] = 1;`: Setting the connection in both directions symmetrically proves an **undirected graph** relationship. Vertex 1 points to 2, and 2 explicitly points back to 1.
- `if (matrix[0][1] == 1)`: Immediately jumps to the specific coordinates in the grid, evaluating to true because the value is 1.
- `std::cout << ...`: Prints the confirmation to the console.

### CS Lens
This structure maps to a mathematical square matrix. To check if an edge exists between any two vertices takes $O(1)$ constant time: you perform exactly one memory array lookup. However, finding all neighbors of a specific vertex takes $O(V)$ time, because you must scan the entire row (all $V$ columns) to see which elements are 1. The space complexity is heavily $O(V^2)$.

### SE Lens
The tradeoff chosen here optimizes for instant edge verification at the cost of massive memory overhead. If you have 10,000 users, this matrix allocates 100,000,000 integers. If most users only have 5 friends, 99.99% of your memory is wasted holding zeroes. Matrices are built for densely connected graphs where the fast $O(1)$ check is mandatory.

### Run It Yourself
1. Save the code in `matrix.cpp`.
2. Compile: `g++ -std=c++17 matrix.cpp -o matrix`.
3. Run: `./matrix`.
4. Observe the output verifying both the directed and undirected edges.

### Discard the Example
This code has proven its point. Delete it; it does not carry forward.

---

## Concept Unit: Edge Weights

### The Problem
Connections in the real world are rarely perfectly equal. A flight from New York to London takes longer than a flight from New York to Boston; a network packet dropping into a congested route costs more latency than an open pipe. A matrix filled with `1`s and `0`s only records existence, not cost. You need to assign numbers to edges.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    int numVertices = 3;
    
    std::vector<std::vector<int>> weights(numVertices, std::vector<int>(numVertices, -1));
    
    weights[0][1] = 50;
    
    weights[1][2] = 10;
    
    if (weights[0][1] != -1) {
        std::cout << "Traversal cost from 0 to 1 is " << weights[0][1] << "\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>`: Includes the standard I/O library.
- `#include <vector>`: Includes the `std::vector` definition.
- `int numVertices = 3;`: Declares the number of vertices.
- `std::vector<std::vector<int>> weights`: Declares the nested vector representing the two-dimensional grid.
- `(numVertices, std::vector<int>(numVertices, -1))`: Sizes the grid to 3x3. Crucially, it fills the grid with `-1` rather than `0`. In a weighted graph, `0` is often a valid cost (e.g., a free transition). You must use an impossible value—like a negative distance—to signify "no edge exists."
- `weights[0][1] = 50;`: Replaces the `-1` at coordinates `[0][1]` with the integer `50`. This assigns a **weight** to the edge.
- `weights[1][2] = 10;`: Assigns a weight of `10` to the edge from 1 to 2.
- `if (weights[0][1] != -1)`: Checks the array index against `-1` to ensure the edge physically exists before attempting to read its weight.
- `std::cout << ...`: Reads `weights[0][1]` again and prints `50` to the console.

### CS Lens
Adding weights does not alter the asymptotic complexity. It is still an $O(V^2)$ memory structure, and checking the cost of an edge is still $O(1)$. You have simply repurposed the value at the intersection to hold quantitative data instead of binary data.

### SE Lens
The alternative not chosen is storing separate Edge objects in a parallel structure. By embedding the weight directly inside the matrix, you keep cache locality high and lookups instantaneous. The engineering debt here is reserving an invalid value (`-1` or `INT_MAX`) specifically to represent emptiness, which requires every edge-checking function to correctly validate against that sentinel value before processing a weight.

### Run It Yourself
1. Save the code in `weights.cpp`.
2. Compile: `g++ -std=c++17 weights.cpp -o weights`.
3. Run: `./weights`.
4. Observe the output printing the cost of 50.

### Discard the Example
Delete this file. We are changing memory layouts entirely in the next unit.

---

## Concept Unit: Adjacency List

### The Problem
The $O(V^2)$ memory scaling of the adjacency matrix is unacceptable for large, sparse datasets like social networks or geographic maps. You need a data structure that drops the square grid entirely and only allocates memory for the edges that actually exist in reality.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    int numVertices = 3;
    
    std::vector<std::vector<int>> adjList(numVertices);
    
    adjList[0].push_back(1);
    
    adjList[1].push_back(2);
    adjList[2].push_back(1);
    
    std::cout << "Neighbors of vertex 1:\n";
    for (int neighbor : adjList[1]) {
        std::cout << "-> " << neighbor << "\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>`: Includes the console output definitions.
- `#include <vector>`: Includes the `std::vector` implementation.
- `int numVertices = 3;`: Declares our three starting vertices.
- `std::vector<std::vector<int>> adjList`: Declares a nested vector.
- `(numVertices)`: Initializes the outer vector to contain exactly 3 inner vectors. Crucially, the inner vectors are left totally empty (size 0). There is no square grid.
- `adjList[0].push_back(1);`: The `[0]` operator targets the first inner vector. `push_back(1)` instructs that inner vector to dynamically allocate memory and append the value `1` to its end. This directed edge costs exactly one integer of storage, not an entire row.
- `adjList[1].push_back(2);` and `adjList[2].push_back(1);`: Vertex 1 records 2 as a neighbor, and vertex 2 records 1 as a neighbor, creating an undirected relationship using precisely two integers.
- `for (int neighbor : adjList[1])`: A range-based for loop. It asks the specific inner vector at index 1 for its beginning and end iterators. It loops exactly once per actual connection, pulling each connected vertex ID into the local `neighbor` variable.
- `std::cout << ...`: Prints the neighbor ID to the screen.

### CS Lens
This is an Adjacency List. The space complexity is precisely $O(V + E)$—you store exactly one slot for every vertex, and one integer for every edge. For sparse graphs, $O(V + E)$ is vastly smaller than $O(V^2)$. Iterating over a vertex's neighbors takes $O(E_{avg})$ time (where $E_{avg}$ is the number of connections that vertex actually has), which is far faster than scanning an entire matrix row of zeroes. The loss is that checking if a specific edge exists takes $O(E_{avg})$ time, because you must scan the list.

### SE Lens
The tradeoff chosen is memory and iteration speed at the cost of lookup speed. Software engineering defaults to the adjacency list for nearly all graph problems because real-world networks are predominantly sparse. It is extremely rare for every entity to connect to every other entity; designing a system to optimize for that rare case by allocating billions of zeroes is an architecture failure. 

### Run It Yourself
1. Save the code in `list.cpp`.
2. Compile: `g++ -std=c++17 list.cpp -o list`.
3. Run: `./list`.
4. Observe the output showing exactly vertex 2 as the neighbor.

### Discard the Example
Delete this code. We will modernize the vertex keys next.

---

## Concept Unit: Hash-Mapped Graph

### The Problem
Using `std::vector` requires every vertex to be tightly packed integers starting exactly at zero. If your dataset identifies vertices by names, IP addresses, or scattered UUIDs, you cannot use them as vector indices. You need a way to build an adjacency list that natively understands arbitrary, non-sequential keys.

### The New Code
```cpp
#include <iostream>
#include <unordered_map>
#include <vector>
#include <string>

int main() {
    std::unordered_map<std::string, std::vector<std::string>> graph;
    
    graph["New York"].push_back("London");
    graph["New York"].push_back("Tokyo");
    graph["London"].push_back("New York");
    
    std::cout << "Flights out of New York:\n";
    for (const std::string& dest : graph["New York"]) {
        std::cout << "-> " << dest << "\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>`, `#include <vector>`, `#include <string>`: Includes standard library dependencies.
- `#include <unordered_map>`: Includes the hash table implementation, providing constant-time key lookups without sorting overhead.
- `std::unordered_map<std::string, std::vector<std::string>> graph;`: Instantiates a map. The key is a `std::string` (the name of the vertex). The value mapped to that key is a `std::vector<std::string>` (the adjacency list of connected neighbors).
- `graph["New York"]`: The `[]` operator searches the hash table for the key `"New York"`. Because it does not exist, the map creates it, internally default-constructing an entirely empty `std::vector`.
- `.push_back("London");`: Calls `push_back` on the vector that the map just returned, appending `"London"` to the adjacency list.
- `graph["New York"].push_back("Tokyo");`: The `[]` operator runs the hash function again, finds the existing `"New York"` entry, and returns its vector by reference, allowing `push_back` to append `"Tokyo"` as the second edge.
- `graph["London"].push_back("New York");`: Builds a reciprocal edge, ensuring London points back to New York.
- `for (const std::string& dest : graph["New York"])`: Uses a range-based for loop over the vector returned by `graph["New York"]`. It specifies `const std::string& dest` to read each string by reference, completely avoiding the computational cost of copying the string bytes into a new local variable during each iteration.
- `std::cout << ...`: Prints the destination.

### CS Lens
You have replaced the outer array with a hash table. The hash function converts the string key into an integer memory location in $O(1)$ time. This gives you the exact same performance characteristics as the vector-based adjacency list—$O(V + E)$ space complexity—but abstracts away the requirement that vertices be sequential integers. 

### SE Lens
The alternative not chosen is keeping a vector-based graph and writing a separate `std::map` that translates strings to `int` IDs. The tradeoff here is cleaner, direct logic at the cost of slightly slower operations. Hashing a string on every lookup takes more CPU cycles than reading a raw array index. In highly performance-critical systems like game pathfinding, engineers enforce integer IDs specifically to use raw vectors. In business logic, the direct `std::unordered_map` prevents translation errors and simplifies the codebase.

### Run It Yourself
1. Save the code in `map_graph.cpp`.
2. Compile: `g++ -std=c++17 map_graph.cpp -o map_graph`.
3. Run: `./map_graph`.
4. Observe the output showing flights to London and Tokyo.

### Discard the Example
Delete this code. You have proven the mapping structure.

---

## Connect the Pieces

Observe how the memory requirement transformed. You started with a fixed $V \times V$ grid where asserting a connection was a simple numeric assignment. When that proved too rigid and memory-intensive for sparse data, you pivoted to dynamic `std::vector` arrays, allocating memory strictly for edges that exist. Finally, you decoupled the data structure from sequential integers by wrapping those vectors inside a `std::unordered_map`, creating a flexible graph capable of mapping real-world string entities to each other without pre-defining the total vertex count.

## What Breaks Without This

If you try to map a non-existent key in an adjacency list without recognizing how the `[]` operator works, you pollute your memory.

Modify the `std::unordered_map` code to check if a city has flights:
```cpp
if (graph["Berlin"].empty()) {
    std::cout << "No flights out of Berlin.\n";
}
```

This compiles and runs cleanly, printing the message. However, the `[]` operator is designed to forcefully create a key if it is missing. Just by executing `graph["Berlin"]` inside an `if` statement, you permanently inserted `"Berlin"` into your graph with an empty vector. To correctly check without modifying, you must use `graph.find("Berlin")`.

## Exercises

1. **Matrix Evaluation:** Write an $O(V^2)$ adjacency matrix with 4 vertices. Create a `for` loop that iterates through every cell. If `matrix[i][j] == 1`, print the edge.
2. **Weighted Adjacency List:** An adjacency list can hold weights by storing pairs. Modify the `std::vector` list to be `std::vector<std::vector<std::pair<int, int>>>`, where the pair holds the destination vertex and the weight.
3. **Map Verification:** Using the `std::unordered_map` graph, write code that securely verifies if `"Paris"` exists as a vertex using `.find()` instead of the `[]` operator.

## Definition of Done

- [ ] You have compiled and run a matrix graph and manipulated exact array indices.
- [ ] You have compiled and run a weighted graph with a sentinel value.
- [ ] You have compiled and run a vector-based adjacency list, understanding its memory footprint.
- [ ] You have compiled and run a map-based adjacency list using string keys.
- [ ] You can explain out loud the exact memory tradeoff between an adjacency matrix and an adjacency list.
