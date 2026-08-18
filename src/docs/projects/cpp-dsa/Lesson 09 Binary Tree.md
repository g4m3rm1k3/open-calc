# Lesson 09: Binary Tree

**What you will build:** You will build a hierarchical data structure from scratch using connected nodes to represent relationships that are not strictly linear. You will implement a binary tree and write recursive functions to traverse its elements in three specific orders, proving how traversal choice guarantees different visit sequences.

**What you need to know first:** C++ From Scratch Lesson 03 Pointers, Lesson 20 Recursion.

**Terms used in this lesson:**
- **Binary Tree** — A hierarchical data structure where each element has at most two outgoing connections. *Why it exists:* To represent data with branching relationships, or to organize data to make search and insertion significantly faster than a flat linear array.
- **Node** — The fundamental container block in a tree. *Why it exists:* To package a piece of data together with the pointers that connect it to its descendants.
- **Root** — The single topmost node in a tree. *Why it exists:* To serve as the definitive entry point for the entire structure; if you lose the root, you lose the tree.
- **Leaf** — A node that has no children. *Why it exists:* To represent the absolute bottom edges of the structure, serving as the natural base case where recursive operations stop.
- **Left Child / Right Child** — The specific left or right descending connection from a node. *Why it exists:* To give structural meaning to position; in many algorithms, going left implies a different rule than going right.
- **Traversal** — The process of visiting every node in a tree exactly once. *Why it exists:* To serialize or inspect a multi-dimensional structure into a flat sequence of actions.

**Objects and methods used:**
- **`TreeNode`**
  - *What it is:* A custom structure representing a single element in the tree.
  - *Implementation:* `struct TreeNode { int data; TreeNode* left; TreeNode* right; };`
  - *Its use:* Acts as the structural building block, instantiated dynamically to grow the tree in memory.

---

## Concept Unit: Node Structure and the Root

### The Problem
Linear structures like vectors and linked lists force a strictly one-after-another sequence. If you want to model a decision tree, a family tree, or a structure where data naturally splits into multiple paths, a linear sequence fails. You need a structure where one element can point to multiple subsequent elements.

### The New Code
```cpp
#include <iostream>

struct TreeNode {
    int data;
    TreeNode* left;
    TreeNode* right;
    
    TreeNode(int value) {
        data = value;
        left = nullptr;
        right = nullptr;
    }
};

int main() {
    TreeNode* root = new TreeNode(10);
    root->left = new TreeNode(5);
    root->right = new TreeNode(15);
    
    std::cout << "Root: " << root->data << "\n";
    std::cout << "Left child: " << root->left->data << "\n";
    std::cout << "Right child: " << root->right->data << "\n";
    
    // Cleanup
    delete root->left;
    delete root->right;
    delete root;
    
    return 0;
}
```

### Mechanical Walkthrough
- `struct TreeNode`: Defines a new composite data type. Unlike a linked list node with one `next` pointer, this contains two.
- `int data;`: The actual payload this node holds.
- `TreeNode* left;`: A pointer to another `TreeNode` representing the left branch.
- `TreeNode* right;`: A pointer to another `TreeNode` representing the right branch.
- `TreeNode(int value)`: The constructor. It assigns the payload and explicitly initializes both child pointers to `nullptr`, guaranteeing that a newly created node is safely recognized as a leaf.
- `TreeNode* root = new TreeNode(10);`: Dynamically allocates the topmost node of the tree and holds its memory address in `root`.
- `root->left = new TreeNode(5);`: Allocates a new node and attaches it to the `left` pointer of the `root`.
- `root->right = new TreeNode(15);`: Allocates another node and attaches it to the `right` pointer.
- `root->left->data`: Chained pointer access. It follows the root's left pointer to the child node, and reads its `data` field.

### CS Lens
This is a **directed acyclic graph** restricted to at most two outgoing edges per node. By strictly forbidding cycles (a child pointing back to an ancestor), the tree guarantees that you can follow pointers infinitely downward without ever entering an infinite loop. 
Also recognized in: abstract syntax trees in compilers, the Document Object Model (DOM) in web browsers, and file system directory hierarchies.

### SE Lens
The alternative not chosen is storing tree relationships implicitly in a flat array (like a binary heap). The tradeoff is flexibility: the pointer-based node structure allows you to graft or prune entire subtrees simply by reassigning a single pointer in constant time, whereas an array-backed tree would require shifting massive amounts of memory.

### Run It Yourself
1. Open a terminal and create a file named `tree_node.cpp` with the code above.
2. Compile it: `g++ -std=c++17 tree_node.cpp -o tree_node`.
3. Run the executable: `./tree_node`.
4. Observe the output:
   Root: 10
   Left child: 5
   Right child: 15

---

## Concept Unit: Inorder Traversal

### The Problem
Now that you have a branching structure, a simple `for` loop no longer works. You need an algorithm that systematically visits every node in the tree without missing any or visiting any twice. Specifically, if you want to visit the left side, then the current node, and then the right side, you need a recursive strategy.

### The New Code
```cpp
#include <iostream>

struct TreeNode {
    int data;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int value) { data = value; left = nullptr; right = nullptr; }
};

void inorder(TreeNode* node) {
    if (node == nullptr) {
        return;
    }
    inorder(node->left);
    std::cout << node->data << " ";
    inorder(node->right);
}

int main() {
    TreeNode* root = new TreeNode(10);
    root->left = new TreeNode(5);
    root->right = new TreeNode(15);
    root->left->left = new TreeNode(2);
    root->left->right = new TreeNode(7);
    
    std::cout << "Inorder: ";
    inorder(root);
    std::cout << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `void inorder(TreeNode* node)`: A function that takes a pointer to a tree node and returns nothing, designed to be called recursively.
- `if (node == nullptr)`: The recursive base case. If the traversal steps off the bottom of a leaf, the pointer is null.
- `return;`: Immediately stops execution for this specific call, preventing null pointer dereferences and unwinding the call stack back to the parent.
- `inorder(node->left);`: The function pauses its own execution and recursively calls itself on the left child. This ensures the entire left subtree is processed before the current node does anything else.
- `std::cout << node->data << " ";`: The "visit" action. This prints the node's payload. Crucially, this happens *after* the left recursive call finishes, but *before* the right recursive call begins.
- `inorder(node->right);`: After printing its own data, the function recursively processes the entire right subtree.

1. `inorder(10)` — Passes the root. Not null. Calls `inorder(5)`.
2. `inorder(5)` — Not null. Calls `inorder(2)`.
3. `inorder(2)` — Not null. Calls `inorder(nullptr)`.
4. `inorder(nullptr)` — Hits the base case, returns immediately.
5. `inorder(2)` resumes — Prints `2`. Calls right child `inorder(nullptr)`, which returns. `inorder(2)` finishes.
6. `inorder(5)` resumes — Prints `5`. Calls right child `inorder(7)`.

### CS Lens
Inorder traversal strictly guarantees a **Left, Root, Right** visit order. When applied to a Binary Search Tree (where left children are smaller and right children are larger), an inorder traversal will naturally visit the elements in perfectly sorted ascending order.

### SE Lens
The alternative not chosen is an iterative traversal using a manual `std::stack`. The tradeoff is code complexity versus call stack safety. Recursion relies on the system call stack to remember where it is, making the code elegant and minimal, but a maliciously deep tree could cause a stack overflow. Iterative traversal uses heap memory (a stack object), avoiding stack overflows at the cost of significantly harder-to-read boilerplate.

### Run It Yourself
1. Save the code in `inorder.cpp`.
2. Compile: `g++ -std=c++17 inorder.cpp -o inorder`.
3. Run: `./inorder`.
4. Observe the output:
   Inorder: 2 5 7 10 15

---

## Concept Unit: Preorder Traversal

### The Problem
Inorder traversal visits the bottom-left first. But if you want to serialize the tree to a file, or create an exact structural clone of the tree, visiting the children before the parent makes reconstruction impossible because you won't know what node is the root. You need an order that guarantees a parent is visited *before* any of its children.

### The New Code
```cpp
#include <iostream>

struct TreeNode {
    int data;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int value) { data = value; left = nullptr; right = nullptr; }
};

void preorder(TreeNode* node) {
    if (node == nullptr) return;
    
    std::cout << node->data << " ";
    preorder(node->left);
    preorder(node->right);
}

int main() {
    TreeNode* root = new TreeNode(10);
    root->left = new TreeNode(5);
    root->right = new TreeNode(15);
    root->left->left = new TreeNode(2);
    root->left->right = new TreeNode(7);
    
    std::cout << "Preorder: ";
    preorder(root);
    std::cout << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `void preorder(TreeNode* node)`: The recursive function for preorder traversal.
- `std::cout << node->data << " ";`: The "visit" action happens **first**. The node processes its own payload before even looking at its children.
- `preorder(node->left);`: Recursively processes the entire left subtree.
- `preorder(node->right);`: Recursively processes the entire right subtree.

1. `preorder(10)` — Prints `10` immediately. Then calls `preorder(5)`.
2. `preorder(5)` — Prints `5` immediately. Then calls `preorder(2)`.
3. `preorder(2)` — Prints `2` immediately. Both children are null, so it finishes.
4. `preorder(5)` resumes — Calls right child `preorder(7)`.
5. `preorder(7)` — Prints `7`.

### CS Lens
Preorder traversal strictly guarantees a **Root, Left, Right** visit order. Because the root of any given subtree is processed before its descendants, it is the standard algorithm used to copy or serialize a tree. If you insert elements into a new binary tree in preorder sequence, the new tree will have the exact same shape as the original.

### SE Lens
The alternative not chosen is Level-Order (Breadth-First) traversal, which visits nodes row-by-row top-down using a queue. Preorder is a Depth-First Search (DFS) algorithm, diving down to the leaves before exploring sibling branches. Preorder uses strictly less memory than breadth-first for deep, narrow trees because its memory usage scales with tree depth, not tree width.

### Run It Yourself
1. Save the code in `preorder.cpp`.
2. Compile: `g++ -std=c++17 preorder.cpp -o preorder`.
3. Run: `./preorder`.
4. Observe the output:
   Preorder: 10 5 2 7 15

---

## Concept Unit: Postorder Traversal

### The Problem
Sometimes a parent node cannot do its job until its children have completely finished theirs. For example, if you are writing a destructor to clean up the tree's memory, deleting the parent first destroys the pointers you need to find the children. You need an order that guarantees a parent is visited *only after* all its descendants have been fully processed.

### The New Code
```cpp
#include <iostream>

struct TreeNode {
    int data;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int value) { data = value; left = nullptr; right = nullptr; }
};

void postorder(TreeNode* node) {
    if (node == nullptr) return;
    
    postorder(node->left);
    postorder(node->right);
    std::cout << node->data << " ";
}

int main() {
    TreeNode* root = new TreeNode(10);
    root->left = new TreeNode(5);
    root->right = new TreeNode(15);
    root->left->left = new TreeNode(2);
    root->left->right = new TreeNode(7);
    
    std::cout << "Postorder: ";
    postorder(root);
    std::cout << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `void postorder(TreeNode* node)`: The recursive function for postorder traversal.
- `postorder(node->left);`: Recursively processes the entire left subtree first.
- `postorder(node->right);`: Recursively processes the entire right subtree second.
- `std::cout << node->data << " ";`: The "visit" action happens **last**. The node only processes its own payload after both recursive child calls have completely finished and returned.

1. `postorder(10)` — Calls `postorder(5)`.
2. `postorder(5)` — Calls `postorder(2)`.
3. `postorder(2)` — Left is null, right is null. Prints `2`. Finishes.
4. `postorder(5)` resumes — Calls `postorder(7)`.
5. `postorder(7)` — Left is null, right is null. Prints `7`. Finishes.
6. `postorder(5)` resumes — Both children finished. Prints `5`. Finishes.

### CS Lens
Postorder traversal strictly guarantees a **Left, Right, Root** visit order. It is an inherently "bottom-up" approach. 
Also recognized in: postfix mathematical notation (Reverse Polish Notation) calculators, computing the total size of a directory on disk (you must sum the files inside before you know the folder's size), and safely destroying dynamic graph structures.

### SE Lens
The alternative not chosen is using smart pointers (`std::unique_ptr`) to implicitly handle the destruction. If a `TreeNode` uses `std::unique_ptr<TreeNode> left`, the compiler will automatically generate a postorder-like destruction sequence when the root goes out of scope. We write it manually here to understand the algorithmic guarantee that makes safe destruction possible.

### Run It Yourself
1. Save the code in `postorder.cpp`.
2. Compile: `g++ -std=c++17 postorder.cpp -o postorder`.
3. Run: `./postorder`.
4. Observe the output:
   Postorder: 2 7 5 15 10

---

## Connect the Pieces

A single tree structure—built of `TreeNode` blocks connected by `left` and `right` pointers—can be serialized in completely different ways purely by shifting the timing of the visit action inside a recursive function. When you call `inorder(root)`, the 10 waits for the left subtree, printing exactly in the middle. When you call `preorder(root)`, the 10 prints immediately, serving as a structural anchor. When you call `postorder(root)`, the 10 prints dead last, proving it safely waited for its entire dependency chain to resolve. The data structure didn't change; the recursive guarantee did.

## What Breaks Without This

If you accidentally write a cycle into your tree creation, your traversals will fatally loop.

Modify the `preorder` setup to intentionally cause a cycle:
```cpp
TreeNode* root = new TreeNode(10);
root->left = new TreeNode(5);
root->left->left = root; // Cycle! 5's left child points back to the root.

preorder(root);
```

**The compiler error (Runtime failure):**
`Segmentation fault (core dumped)`

Because the tree rule is violated, `preorder(root)` visits 10, goes left to 5, goes left back to 10, goes left to 5, infinitely repeating until the system call stack exhausts its memory limit and the operating system violently kills the process.

## Exercises

1. **Sum the Tree:** Write a recursive function `int sumTree(TreeNode* node)` that returns the total sum of all `data` fields in the tree. (Hint: Think postorder—sum the left, sum the right, add your own data, and return it).
2. **Count Leaves:** Write a recursive function `int countLeaves(TreeNode* node)` that returns the number of nodes that have no children.
3. **Safe Deletion:** Write a `void destroyTree(TreeNode* node)` function that uses the postorder pattern to safely call `delete node;` only after its children have been recursively deleted. Call it at the end of `main`.

## Definition of Done

- [ ] You have compiled and run the basic `TreeNode` structure and accessed child properties.
- [ ] You have run an Inorder traversal and observed the elements printing from bottom-left inward.
- [ ] You have run a Preorder traversal and observed the parent printing before any of its descendants.
- [ ] You have run a Postorder traversal and observed the root printing absolutely last.
- [ ] You can explain out loud why a postorder traversal is the only safe way to manually delete a tree.
