# Lesson 10: Binary Search Tree

**What you will build:** You will write isolated console programs that construct, search, and mutate a Binary Search Tree (BST) using raw C++ pointers. These programs demonstrate how to organize data dynamically so that insertions, lookups, and deletions can be performed efficiently without scanning the entire collection. The transferable problem this solves is maintaining a sorted dataset that can be searched quickly even as new items are added or removed.

**What you need to know first:** Lesson 09 Binary Tree, Lesson 03 Pointers, Lesson 04 Memory Management.

**Terms used in this lesson:**
- **Binary Search Tree (BST)** — A binary tree where every node's left children contain only strictly smaller values, and its right children contain only strictly larger values. *Why it exists:* To allow binary search (cutting the search space in half at each step) on a dynamic, node-based data structure that can grow and shrink without reallocating arrays.
- **Inorder Successor** — The node containing the smallest value that is strictly greater than a given node. *Why it exists:* To find the correct mathematical replacement node when deleting a node that has two children, preserving the global BST property.
- **Degenerate Tree** — A tree where every node has only one child, effectively forming a linked list. *Why it exists:* It is the pathological failure state of a naive BST when data is inserted in already-sorted order, demonstrating why plain BSTs break down and self-balancing variants are necessary.

**Objects and methods used:**
- **`Node` `struct`**
  - *What it is:* The foundational building block of the tree, representing a single location in memory.
  - *Implementation:* `struct Node { int data; Node* left; Node* right; };`
  - *Its use:* Holds a single value and owns the raw pointers to its left and right subtrees.
- **`std::set<T>` / `insert`**
  - *What it is:* The C++ Standard Library's implementation of a balanced binary search tree, holding unique elements.
  - *Implementation:* `std::pair<iterator, bool> insert(const T& value);`
  - *Its use:* Provides a ready-to-use BST that guarantees fast performance and manages its own memory internally, freeing you from raw pointer manipulation in production code.

---

## Concept Unit: The BST Property and Insertion

### The Problem
A standard binary tree has no rules about where data goes. If you want to find a specific number in a plain binary tree, you must visit every node until you find it, which takes O(n) time. You need a structure that organizes data upon insertion so that you know exactly which path to take to find it later, ignoring the rest of the tree.

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* left;
    Node* right;
    
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

Node* insert(Node* root, int value) {
    if (root == nullptr) {
        return new Node(value);
    }
    
    if (value < root->data) {
        root->left = insert(root->left, value);
    } else if (value > root->data) {
        root->right = insert(root->right, value);
    }
    // If value == root->data, we do nothing (no duplicates allowed).
    
    return root;
}

void printInOrder(Node* root) {
    if (root == nullptr) return;
    printInOrder(root->left);
    std::cout << root->data << " ";
    printInOrder(root->right);
}

void destroy(Node* root) {
    if (root == nullptr) return;
    destroy(root->left);
    destroy(root->right);
    delete root;
}

int main() {
    Node* root = nullptr;
    root = insert(root, 50);
    insert(root, 30);
    insert(root, 70);
    insert(root, 20);
    insert(root, 40);
    
    std::cout << "Inorder traversal: ";
    printInOrder(root);
    std::cout << "\n";
    
    destroy(root);
    return 0;
}
```

### Mechanical Walkthrough
- `Node(int val)`: A constructor that initializes the node's payload and explicitly nullifies both child pointers, proving this new node is currently a leaf.
- `if (root == nullptr)`: The base case of the recursion. If we reach a null pointer, we have found the exact empty spot where this new value belongs.
- `return new Node(value);`: Allocates memory for the new node and returns its address up the call stack so the parent node can link to it.
- `if (value < root->data)`: The defining rule of the **Binary Search Tree**. If the incoming value is smaller than the current node's value, it must exist somewhere in the left subtree.
- `root->left = insert(root->left, value);`: Recursively calls `insert` on the left child. The return value is assigned back to `root->left` to re-establish the link in case the left child was previously null.
- `else if (value > root->data)`: Symmetrically, if the value is larger, it must go to the right subtree.
- `printInOrder(root)`: Traverses the left subtree, prints the current node, then traverses the right subtree. Because of the BST property, this mathematically guarantees the values are printed in sorted ascending order.

### CS Lens
This structure enables **binary search**. At every step down the tree, you discard half of the remaining nodes. If you are looking for 30 and the root is 50, you know with absolute certainty that 30 cannot be in the right subtree. You never even look at the right subtree. This reduces the time complexity of insertion from linear O(n) to logarithmic O(log n), assuming the tree is reasonably balanced.

### SE Lens
The alternative not chosen is keeping a dynamically resizing array (like `std::vector`) and calling `std::sort` after every insertion. The tradeoff here is write performance. Sorting an entire array takes O(n log n) time and requires moving chunks of memory around. A BST achieves the same sorted guarantee by simply changing a few pointers in O(log n) time, making it vastly superior for datasets that experience frequent insertions.

### Run It Yourself
1. Open a terminal and save the code in `bst_insert.cpp`.
2. Compile: `g++ -std=c++17 bst_insert.cpp -o bst_insert`.
3. Run: `./bst_insert`.
4. Observe the output:
   `Inorder traversal: 20 30 40 50 70`
5. This throwaway code is now explicitly discarded. We will build a new iteration to demonstrate searching.

---

## Concept Unit: Searching a BST

### The Problem
Now that the tree enforces the property `left < root < right`, we need an algorithm that actually exploits this property to find data. A naive tree traversal checks every node. We need a function that actively chooses which path to take, halting as soon as it finds the target or proves the target does not exist.

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* left;
    Node* right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

Node* insert(Node* root, int value) {
    if (root == nullptr) return new Node(value);
    if (value < root->data) root->left = insert(root->left, value);
    else if (value > root->data) root->right = insert(root->right, value);
    return root;
}

bool search(Node* root, int target) {
    if (root == nullptr) {
        return false;
    }
    
    if (root->data == target) {
        return true;
    }
    
    if (target < root->data) {
        return search(root->left, target);
    } else {
        return search(root->right, target);
    }
}

int main() {
    Node* root = nullptr;
    root = insert(root, 50);
    insert(root, 30);
    insert(root, 70);
    
    std::cout << "Search 30: " << (search(root, 30) ? "Found" : "Missing") << "\n";
    std::cout << "Search 99: " << (search(root, 99) ? "Found" : "Missing") << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `bool search(Node* root, int target)`: A function that takes a starting node and the value to find, returning a boolean indicating presence.
- `if (root == nullptr) return false;`: The failure base case. If we hit the bottom of the tree without finding the target, the target absolutely does not exist in the collection.
- `if (root->data == target) return true;`: The success base case. We found the exact value.
- `if (target < root->data)`: The routing logic. We compare the target against the current node. If it is smaller, we recursively search only the left child.
- `else return search(root->right, target);`: If it is larger, we recursively search only the right child.

1. `search(root, 30)` — compares 30 to root (50). 30 < 50, so it proceeds left.
2. `search(root->left, 30)` — compares 30 to the new root (30). 30 == 30, returning true immediately. The right side of the tree (70) was never accessed.

### CS Lens
This is the tree equivalent of the binary search algorithm used on sorted arrays. It operates in O(h) time, where `h` is the height of the tree. If the tree is full and balanced, `h` is log(n). 

### SE Lens
The alternative not chosen is an iterative `while` loop instead of recursion. Recursion uses stack memory for every level descended. If the tree is millions of nodes deep, recursion could trigger a stack overflow. In production systems (like the Linux kernel's scheduling trees), tree traversals are often written iteratively to guarantee safety, but recursion is taught first because it directly mirrors the tree's own recursive mathematical definition.

### Run It Yourself
1. Save the code in `bst_search.cpp`.
2. Compile and run it.
3. Observe the output:
   `Search 30: Found`
   `Search 99: Missing`
4. This throwaway code is now explicitly discarded. 

---

## Concept Unit: Deletion in a BST

### The Problem
Removing a node from a BST is not as simple as deleting the memory. If the node being deleted has children, those children must be reattached to the rest of the tree. Crucially, the reattachment must not violate the `left < root < right` rule. This creates three distinct scenarios: deleting a leaf (no children), deleting a node with one child, and the complex case of deleting a node with two children.

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* left;
    Node* right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

Node* findMin(Node* node) {
    while (node && node->left != nullptr) {
        node = node->left;
    }
    return node;
}

Node* deleteNode(Node* root, int key) {
    if (root == nullptr) return root;
    
    if (key < root->data) {
        root->left = deleteNode(root->left, key);
    } else if (key > root->data) {
        root->right = deleteNode(root->right, key);
    } else {
        // We found the node to delete
        
        // Case 1 & 2: No child or exactly one child
        if (root->left == nullptr) {
            Node* temp = root->right;
            delete root;
            return temp;
        } else if (root->right == nullptr) {
            Node* temp = root->left;
            delete root;
            return temp;
        }
        
        // Case 3: Two children
        Node* temp = findMin(root->right);
        root->data = temp->data;
        root->right = deleteNode(root->right, temp->data);
    }
    return root;
}

void printInOrder(Node* root) {
    if (root == nullptr) return;
    printInOrder(root->left);
    std::cout << root->data << " ";
    printInOrder(root->right);
}

// Assume insert() and destroy() are present identically to the first unit
```

### Mechanical Walkthrough
- `Node* findMin(Node* node)`: A helper function that simply walks left as far as possible. Because smaller values are always to the left, the leftmost node in any subtree is mathematically guaranteed to be its minimum value.
- `if (key < root->data)`: We must first traverse the tree to locate the node, using the exact same routing logic as the `search` function.
- `if (root->left == nullptr)`: Handles **Case 1 (Leaf)** and **Case 2 (One Child)**. If there is no left child, we save the right child pointer in `temp`, delete the current node, and return `temp`. If the right child was also null (a leaf), we just returned `nullptr` to the parent. If it wasn't null (one child), we just bypassed the deleted node and connected its parent directly to its single child.
- `Node* temp = findMin(root->right);`: Handles **Case 3 (Two Children)**. We cannot just bypass this node, because its parent only has one pointer available, and we have two orphaned subtrees. Instead, we find the **Inorder Successor** — the smallest value in the right subtree.
- `root->data = temp->data;`: We do not actually delete the current node's memory. Instead, we overwrite its payload with the successor's payload. The tree structure remains intact, but the target value is gone.
- `root->right = deleteNode(root->right, temp->data);`: We now have two copies of the successor's data. We recursively call `deleteNode` on the right subtree to hunt down and delete the original successor node (which is guaranteed to fall into Case 1 or Case 2, making it easy to remove).

### CS Lens
Case 3 relies on a mathematical trick: the smallest value in the right subtree is the only value guaranteed to be larger than everything in the left subtree, but smaller than everything else in the right subtree. Promoting it to the root position perfectly preserves the BST property without requiring a total rebuild of the tree structure.

### SE Lens
The alternative not chosen is "lazy deletion" (or "tombstoning"), where you simply add a `bool isDeleted` flag to the node and ignore it during searches. The tradeoff is code complexity versus memory. Tombstoning makes deletion O(1) and prevents pointer rewiring bugs entirely, but if your application deletes items frequently, the tree will fill up with dead nodes, wasting memory and slowing down searches. Real databases often use tombstoning and run a background cleanup task later.

### Run It Yourself
You can wrap this in a `main` function, insert `50, 30, 70, 20, 40, 60, 80`, and call `deleteNode(root, 50)`. Printing it inorder will yield `20 30 40 60 70 80` — the root 50 was replaced by 60, and the tree survived. This code is explicitly discarded.

---

## Concept Unit: Unbalanced Degradation

### The Problem
We have stated that BST operations take O(log n) time. However, this relies on an assumption that the tree is relatively balanced — meaning the left and right sides are roughly the same depth. What happens if you insert data that is already sorted?

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* left;
    Node* right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

Node* insert(Node* root, int value) {
    if (root == nullptr) return new Node(value);
    if (value < root->data) root->left = insert(root->left, value);
    else if (value > root->data) root->right = insert(root->right, value);
    return root;
}

int main() {
    Node* root = nullptr;
    root = insert(root, 10);
    insert(root, 20);
    insert(root, 30);
    insert(root, 40);
    insert(root, 50);
    
    std::cout << "Root: " << root->data << "\n";
    std::cout << " -> Right: " << root->right->data << "\n";
    std::cout << "    -> Right: " << root->right->right->data << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `insert(root, 10)`: Becomes the root.
- `insert(root, 20)`: 20 is greater than 10, so it becomes the right child of 10.
- `insert(root, 30)`: 30 is greater than 10 (goes right), greater than 20 (goes right), becomes the right child of 20.

### CS Lens
Because every incoming number is strictly larger than the previous one, the `insert` function exclusively takes the `root->right` path. The left child pointers remain permanently null. This creates a **Degenerate Tree**. Structurally, this is no longer a tree at all; it is a linked list. If you search for 50, you must traverse 10, 20, 30, and 40 first. The time complexity has degraded from O(log n) back to the worst-case O(n).

### SE Lens
This failure mode is why bare, naive Binary Search Trees are almost never used in production software. They are a teaching tool. In the real world, you use self-balancing trees like AVL Trees or Red-Black Trees. These structures automatically perform pointer rotations during insertion to mathematically guarantee the tree remains balanced, preventing the O(n) degradation no matter what order the data arrives in.

### Run It Yourself
Compile and run the code. Observe that the values are exclusively chained down the right side. Discard the code.

---

## Concept Unit: The Standard Library Equivalent (`std::set`)

### The Problem
Writing raw pointers, handling the three deletion cases, and managing memory leaks is dangerous and time-consuming. Furthermore, building a self-balancing Red-Black tree from scratch takes hundreds of lines of complex pointer logic. When you just need a container that enforces uniqueness and keeps elements sorted, you should rely on the standard library.

### The New Code
```cpp
#include <iostream>
#include <set>

int main() {
    std::set<int> numbers;
    
    // Insertion
    numbers.insert(50);
    numbers.insert(30);
    numbers.insert(70);
    numbers.insert(20);
    numbers.insert(40);
    
    // Attempting to insert a duplicate does nothing
    numbers.insert(50); 
    
    // Deletion (handles all child cases internally)
    numbers.erase(30);
    
    // Inorder Traversal
    std::cout << "Tree contents: ";
    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << "\n";
    
    // Searching
    if (numbers.find(40) != numbers.end()) {
        std::cout << "40 is in the tree.\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <set>`: Imports the standard library's self-balancing binary search tree container.
- `std::set<int> numbers;`: Instantiates the tree. No `Node` structs or raw pointers are exposed to you.
- `numbers.insert(50);`: Allocates memory internally, creates the node, and balances the tree automatically. O(log n) time.
- `numbers.erase(30);`: Searches for the value and handles the complex deletion rewiring (including the two-child successor swap) behind the scenes, safely freeing the memory.
- `for (int num : numbers)`: Iterating over a `std::set` inherently performs an inorder traversal, yielding the numbers in strictly sorted ascending order.
- `numbers.find(40)`: Traverses the tree using the BST property, returning an iterator to the item in O(log n) time. If it reaches the bottom without finding it, it returns `numbers.end()`.

### CS Lens
The `std::set` is mandated by the C++ Standard to guarantee O(log n) time complexity for insertions, deletions, and searches. To achieve this, almost all implementations use a Red-Black Tree under the hood. You get the speed of a binary search tree without the fatal O(n) degradation flaw.

### SE Lens
The alternative not chosen is writing your own tree. The tradeoff is absolute control versus safety and time. Unless you are writing a custom memory allocator or an operating system kernel, you should always use `std::set` or `std::map` when you need a BST. It is heavily optimized, entirely memory-safe, and instantly recognizable to other engineers.

### Run It Yourself
1. Save the code in `stl_set.cpp`.
2. Compile: `g++ -std=c++17 stl_set.cpp -o stl_set`.
3. Run it and observe that 30 is gone, duplicates were ignored, and the data remains perfectly sorted: `20 40 50 70`.

---

## Connect the Pieces

Observe how the property `left < root < right` is the engine behind the entire structure. It dictates where new nodes are inserted, it provides the roadmap for searching that cuts the workload in half at every step, and it dictates the complex rules of deletion to ensure the property survives mutations. The structure trades the simple linear layout of arrays for the complexity of disjointed nodes, purely to gain that O(log n) speed advantage.

## What Breaks Without This

If you break the BST property manually, the search algorithm completely fails. Imagine a tree where you forcibly placed `99` as the left child of `50`. If you call `search(root, 99)`, the algorithm compares 99 to 50. Since 99 > 50, the algorithm strictly routes to the right subtree. It will never check the left side, and it will return `false`, confidently claiming 99 is missing even though it physically exists in memory. The data structure is compromised.

## Exercises

1. **Min and Max:** Using the raw pointer tree from the first units, write a function `int findMax(Node* root)` that returns the largest value in the tree. (Hint: think about how `findMin` worked).
2. **Postorder Verification:** Write a `printPostOrder` function that prints the left child, the right child, and then the root. Run it on a tree and observe how the output differs from the sorted inorder traversal.
3. **STL Map:** Read the documentation for `std::map`. It is also a binary search tree, but it stores key-value pairs instead of single elements. Write a program using `std::map<std::string, int>` to store people's names as the search keys and their ages as the payloads.

## Definition of Done

- [ ] You have written a function to insert nodes maintaining the BST property.
- [ ] You have traced how the `search` function ignores half the tree at each step.
- [ ] You can explain why the inorder successor is needed to delete a node with two children.
- [ ] You have witnessed how inserting sorted data destroys the tree's performance.
- [ ] You have replaced the raw pointer implementation with `std::set` and verified it behaves identically.
