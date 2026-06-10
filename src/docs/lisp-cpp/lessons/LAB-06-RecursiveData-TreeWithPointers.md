# Lisp-CPP — LAB 06 — Recursive Data: Building a Tree With Pointers

**Prerequisites:** LAB-05 complete. The lexer works. You understand pointers, structs, enums, and heap allocation.

**What this lab adds:**
- Tree nodes — a struct that contains pointers to other structs of the same type
- Recursive data structure — what it means for a type to refer to itself
- Manual tree construction — building the AST for `(+ 1 2)` by hand
- Tree printing — a recursive function that walks the tree

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You want to represent `(+ 1 2)` as a tree. Draw it on paper. How many nodes?
>    What does each node store?
> 2. A node contains pointers to its children. What type does a child pointer have?
>    (Hint: a child is also a node.)
> 3. If you call `delete` on a parent node but not its children, what happens to
>    the children's memory?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

=== Manual AST for (+ 1 2) ===
(+
  1
  2)

=== Manual AST for (+ (* 2 3) 4) ===
(+
  (*
    2
    3)
  4)

=== Node counts ===
(+ 1 2)       uses 4 nodes
(+ (* 2 3) 4) uses 6 nodes
```

---

## Concept: Trees as Recursive Data Structures

**What it is:** A tree is a structure where each node contains data and zero or more
pointers to other nodes of the same type. The structure is recursive: a node's
children are nodes.

**The Lisp expression as a tree:**

```
(+ 1 2)

         LIST node
        /    |    \
  SYMBOL   NUMBER  NUMBER
    "+"     "1"     "2"
```

```
(+ (* 2 3) 4)

         LIST node
        /         \
  SYMBOL          LIST node       NUMBER
    "+"          /    |    \       "4"
           SYMBOL  NUMBER  NUMBER
             "*"    "2"     "3"
```

**Every Lisp expression is a tree.** Atoms (numbers, symbols, booleans) are leaf
nodes with no children. Lists are internal nodes with one child per element.

**Why a recursive type definition:**

```cpp
struct Node {
    // ... data fields ...
    Node* first_child;   // a pointer to another Node
    Node* next_sibling;  // a pointer to another Node
};
```

A `Node` contains `Node*` — a pointer to a `Node`. The type refers to itself.
This is only possible with pointers: a struct cannot contain itself (infinite size),
but it can contain a pointer to itself (pointer is always 8 bytes).

**Transfer:** Every tree in computing is defined this way: a node containing
pointers to nodes. HTML's DOM is a tree of element nodes. JSON's object model
is a tree. Every file system directory entry points to more directory entries.
Every abstract syntax tree in every compiler. The pattern is ancient and universal.

---

## Concept: Node Design — Two Approaches

**What it is:** There are two standard ways to store a node's children.

**Approach 1 — Parent holds a vector of children:**

```cpp
struct Node {
    NodeKind              kind;      // ATOM or LIST
    std::string           value;     // for atoms: "+" "42" etc.
    std::vector<Node*>    children;  // for lists: child nodes
};
```

Advantages: direct access to nth child (`node->children[2]`), easy to iterate.
Disadvantage: `std::vector` is 24 bytes even when empty — every atom node wastes
24 bytes for a vector it will never use.

**Approach 2 — Left-child right-sibling (LCRS):**

```cpp
struct Node {
    NodeKind  kind;
    std::string value;
    Node*     first_child;    // first child in the list
    Node*     next_sibling;   // next sibling in the parent's list
};
```

Used by early Lisp implementations. Memory-efficient for large trees. Harder to
read. We use Approach 1 for clarity — the vector cost is acceptable.

**We use Approach 1.** Every choice here has a reason. Approach 2 would save
memory at the cost of readability. In LAB-30 (profiling) you would find out
whether that trade-off is worth making.

---

## Concept: NodeKind — Atom vs. List

**What it is:** Every node is either an **atom** (a leaf — a number, symbol, or boolean)
or a **list** (a node with children).

```cpp
enum class NodeKind {
    ATOM,   // leaf: has a value string, no children
    LIST    // internal node: has children, no value string (or value is "")
};
```

**Atoms:** Numbers (`42`, `-7`), symbols (`+`, `define`, `foo`), booleans (`#t`, `#f`).
They have a value string. They have no children.

**Lists:** Parenthesized expressions: `(+ 1 2)`, `(define x 10)`. They have children.
The first child is the operator or keyword. Subsequent children are operands.

**The node struct:**

```cpp
struct Node {
    NodeKind           kind;      // ATOM or LIST
    std::string        value;     // non-empty for ATOMs: "42", "+", "#t"
    std::vector<Node*> children;  // non-empty for LISTs
};
```

An ATOM node has an empty `children` vector. A LIST node has an empty `value` string.
One or the other is always "unused" — this inefficiency is acceptable for clarity.
LAB-09 introduces a cleaner design using a tagged union.

---

## Concept: Ownership and Memory Leaks in Trees

**What it is:** When a node is allocated with `new`, some code must eventually
call `delete` on it. For a tree, the parent "owns" the children — destroying the
parent should destroy the children.

**The problem — shallow delete:**

```cpp
Node* root = new Node{ .kind = NodeKind::LIST };
root->children.push_back(new Node{ .kind = NodeKind::ATOM, .value = "+" });
root->children.push_back(new Node{ .kind = NodeKind::ATOM, .value = "1" });

delete root;   // frees root's memory — but NOT the children
               // ASAN: 2 leaks — the "+" and "1" nodes
```

Deleting `root` frees the `Node` struct and the `std::vector` object inside it.
But the `std::vector` only frees its own internal array of pointers — not the
`Node*` objects those pointers point to. The children are leaked.

**The fix — recursive delete:**

```cpp
void free_tree(Node* node) {
    if (node == nullptr) return;     // nothing to free
    for (Node* child : node->children) {
        free_tree(child);            // recursively free all children first
    }
    delete node;                     // then free this node
}
```

**Order matters:** Free children before freeing the parent. The parent owns the
children — the parent's destructor is the right place to free them. In LAB-17
we replace `free_tree` with `std::unique_ptr`, which calls the equivalent
automatically.

---

## Step 1 — Create `src/node.h` and `src/node.cpp`

```bash
touch src/node.h
touch src/node.cpp
```

Update `CMakeLists.txt`:

```cmake
add_executable(lisp
    src/main.cpp
    src/lexer.cpp
    src/node.cpp    # ← add this
)
```

**`src/node.h`:**

```cpp
#pragma once

#include <string>
#include <vector>

// NodeKind: the two categories of AST node.
enum class NodeKind {
    ATOM,   // leaf node — has a value string, no children
    LIST    // internal node — has children, no value string
};

// Node: one node in the Abstract Syntax Tree.
// ATOM nodes: kind=ATOM, value="+" or "42" or "#t", children is empty
// LIST nodes: kind=LIST, value="",  children holds the list elements
struct Node {
    NodeKind           kind;
    std::string        value;      // meaningful for ATOM nodes
    std::vector<Node*> children;   // meaningful for LIST nodes
};

// Allocate a new atom node on the heap.
// Caller is responsible for calling free_tree() when done.
Node* make_atom(const std::string& value);

// Allocate a new list node on the heap with no children yet.
Node* make_list();

// Recursively free a node and all its descendants.
void free_tree(Node* node);

// Print the tree in indented Lisp notation to stdout.
void print_tree(const Node* node, int indent = 0);
```

**`src/node.cpp`:**

```cpp
#include "node.h"
#include <cstdio>    // printf
#include <cstring>   // (not needed — remove if unused)

// make_atom: allocate a new leaf node with the given value.
Node* make_atom(const std::string& value) {
    Node* node = new Node;           // allocate on heap
    node->kind  = NodeKind::ATOM;   // it is a leaf
    node->value = value;             // store the text ("42", "+", etc.)
    // node->children is default-constructed to an empty vector — no action needed
    return node;
}

// make_list: allocate a new internal node with no children yet.
// Children are added with node->children.push_back(child).
Node* make_list() {
    Node* node = new Node;
    node->kind  = NodeKind::LIST;
    node->value = "";    // lists have no value string
    return node;
}

// free_tree: recursively free a node and all its children.
// Must free children BEFORE the parent: once the parent is deleted,
// accessing node->children is undefined behavior.
void free_tree(Node* node) {
    if (node == nullptr) return;   // guard: nothing to do for null

    // Recursively free every child first.
    for (Node* child : node->children) {
        free_tree(child);          // depth-first — leaves are freed first
    }

    // Now free this node itself.
    delete node;
}

// print_tree: print the tree in indented form.
// indent: current indentation level — starts at 0, increases by 2 per level.
void print_tree(const Node* node, int indent) {
    if (node == nullptr) return;

    // Print 'indent' spaces for visual nesting.
    // %*s in printf: print 'indent' copies of the character ' '
    // (the width argument before the string makes it repeat the space)
    if (indent > 0) {
        printf("%*s", indent, "");    // print 'indent' spaces
    }

    if (node->kind == NodeKind::ATOM) {
        // Leaf: print the value on one line.
        printf("%s\n", node->value.c_str());
    } else {
        // List: print the opening paren, then recurse into children.
        // The first child (operator) appears on the same line as '('.
        printf("(");
        if (!node->children.empty()) {
            // Print first child (operator) inline with the opening paren:
            if (node->children[0]->kind == NodeKind::ATOM) {
                printf("%s\n", node->children[0]->value.c_str());
            } else {
                printf("\n");
                print_tree(node->children[0], indent + 2);
            }

            // Print remaining children indented:
            for (size_t i = 1; i < node->children.size(); i++) {
                if (i == node->children.size() - 1) {
                    // Last child: print closing paren on same line
                    if (node->children[i]->kind == NodeKind::ATOM) {
                        printf("%*s%s)\n", indent + 2, "",
                               node->children[i]->value.c_str());
                    } else {
                        print_tree(node->children[i], indent + 2);
                    }
                } else {
                    print_tree(node->children[i], indent + 2);
                }
            }
        } else {
            printf(")\n");   // empty list
        }
    }
}
```

---

## Step 2 — Build Trees Manually in `main.cpp`

Update `src/main.cpp`:

```cpp
#include <cstdio>
#include "lexer.h"
#include "node.h"    // ← add this

const int VERSION_MAJOR = 0;
const int VERSION_MINOR = 1;

int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n", VERSION_MAJOR, VERSION_MINOR);

    // ── BUILD (+ 1 2) BY HAND ──────────────────────────────────────
    printf("\n=== Manual AST for (+ 1 2) ===\n");

    // The root is a LIST node: (+ 1 2)
    Node* expr1 = make_list();                              // ← add

    // The three children are ATOM nodes:
    expr1->children.push_back(make_atom("+"));  // operator  ← add
    expr1->children.push_back(make_atom("1"));  // operand 1 ← add
    expr1->children.push_back(make_atom("2"));  // operand 2 ← add

    print_tree(expr1);                                      // ← add
    free_tree(expr1);   // ← add — free all 4 nodes (1 list + 3 atoms)
    expr1 = nullptr;    // ← add — null the pointer after free

    // ── BUILD (+ (* 2 3) 4) BY HAND ───────────────────────────────
    printf("\n=== Manual AST for (+ (* 2 3) 4) ===\n");

    // Inner: (* 2 3)
    Node* inner = make_list();                              // ← add
    inner->children.push_back(make_atom("*"));
    inner->children.push_back(make_atom("2"));
    inner->children.push_back(make_atom("3"));

    // Outer: (+ <inner> 4)
    Node* expr2 = make_list();                              // ← add
    expr2->children.push_back(make_atom("+"));
    expr2->children.push_back(inner);   // the inner list is a child of the outer
    expr2->children.push_back(make_atom("4"));

    print_tree(expr2);
    free_tree(expr2);   // frees expr2, inner, and all atom nodes recursively
    expr2 = nullptr;

    return 0;
}
```

### COMPILE AND RUN

```bash
cmake -S . -B build   # regenerate: added node.cpp
cmake --build build
./build/lisp
```

Expected:
```
Lisp interpreter v0.1

=== Manual AST for (+ 1 2) ===
(+
  1
  2)

=== Manual AST for (+ (* 2 3) 4) ===
(+
  (*
    2
    3)
  4)
```

No ASAN output — no leaks. `free_tree` cleaned up correctly.

**Change something:** Remove the `free_tree(expr1)` call. Rebuild and run.
ASAN reports: `LeakSanitizer: detected memory leaks — Direct leak of N byte(s)`.
The exact byte count matches 4 nodes × sizeof(Node). Put the `free_tree` back.

---

## 🎯 Challenge: Count Nodes in a Tree

**You know:** Tree traversal via recursive function, `node->children`, `Node*`.

**Task:** Write `size_t count_nodes(const Node* node)` that returns the total
number of nodes in the tree (including the root).

- `count_nodes` on the `(+ 1 2)` tree → 4 (1 list + 3 atoms)
- `count_nodes` on the `(+ (* 2 3) 4)` tree → 6 (2 lists + 4 atoms)

Print the results after building each tree (before `free_tree`).

<details>
<summary>▶ Show Solution</summary>

```cpp
// count_nodes: return total number of nodes in the subtree rooted at node.
// Base case: null pointer → 0 nodes.
// Recursive case: 1 (this node) + sum of children's counts.
size_t count_nodes(const Node* node) {
    if (node == nullptr) return 0;

    size_t count = 1;   // count this node
    for (const Node* child : node->children) {
        count += count_nodes(child);   // add each subtree's count
    }
    return count;
}

// In main():
printf("Node count: %zu\n", count_nodes(expr1));   // 4
printf("Node count: %zu\n", count_nodes(expr2));   // 6
```

**Key insight:** Tree traversal always has the same shape: check for null (base case),
do something with the current node, recurse into children. This pattern appears in
`print_tree`, `free_tree`, and `count_nodes` — and in `eval()` in LAB-08.
The recursion mirrors the recursion in the data structure.

</details>

---

## What Just Happened

The AST node is the central data structure of the interpreter. The lexer produces
tokens; the parser (LAB-07) reads tokens and builds a tree of `Node*` objects;
the evaluator (LAB-08) walks that tree recursively and produces values.

You built the tree by hand so the structure is completely clear before the
parser generates it automatically. By the end of LAB-07, `parse(tokenize("(+ 1 2)"))` will
produce the exact same tree you just built manually.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `(+ 1 2)` tree built | 4 nodes: 1 list, 3 atoms |
| `print_tree` correct | Output matches expected indented format |
| `free_tree` works | No ASAN leak report after free |
| Nested tree `(+ (* 2 3) 4)` | 6 nodes, inner tree is child of outer |
| Leak detected | Removing `free_tree` causes ASAN to report leaks |
| Challenge complete | `count_nodes` returns 4 and 6 respectively |

---

## Self-Check

1. Why must a struct use `Node*` (a pointer) for its children, not `Node` (a value)?
2. What is the correct order to free a tree — parent first or children first? Why?
3. `print_tree` is recursive. What is its base case?
4. How many `new` calls does `make_list() + 3 × make_atom()` make? How many `delete` calls must `free_tree` make?
5. A node has `kind == NodeKind::LIST` but `children.empty()`. What does this represent in Lisp?

---

## What's Next

LAB-07 builds the parser — the function that reads the lexer's token vector and
produces the node tree you built by hand in this lab. The parser is a recursive
descent function: when it sees `(`, it knows a list begins; it recursively parses
children until it sees `)`.

---

## Quick Check Answers

**1. How many nodes for `(+ 1 2)`?**
Four: one LIST node for the expression, and three ATOM nodes for `+`, `1`, `2`.
The LIST node has three children, each an ATOM.

**2. What type does a child pointer have?**
`Node*` — a pointer to a `Node`. This is the only way to have a recursive type:
a struct can contain a pointer to itself (pointers are always 8 bytes), but
cannot contain itself (infinite size).

**3. What happens if you `delete` a parent but not its children?**
The parent's memory is freed, including the `std::vector` object inside it.
But the `std::vector`'s destructor only frees the array of pointers — not
the `Node*` objects those pointers point to. The child nodes remain on the
heap with no pointer to them: a memory leak. ASAN reports each leaked node
with its allocation location.
