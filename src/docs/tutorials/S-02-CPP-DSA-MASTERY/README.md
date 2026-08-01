# C++ Data Structures & Algorithms — Deep Dive

## Every Data Structure Built From Scratch, Explained As You Type It

---

## What This Is

A from-scratch DSA course in C++ that never throws code at you and asks you to catch up. Every lab builds one data structure or algorithm, one small piece at a time — and before each piece, you get the *why*: why the language feature exists, why the structure needs it, what breaks if you skip it.

You will build your own dynamic array, your own linked lists, your own stack/queue, your own hash table, your own binary search tree — not because the STL versions don't exist, but because building them by hand is the only way to actually understand what `std::vector` and `std::unordered_map` are hiding from you. Only after you've built something by hand do you get shown the STL equivalent and told exactly what it does differently.

Along the way, this series also teaches the C++ language features DSA code actually needs: header/source file separation, operator overloading (`<<`, `[]`, `==`), templates, RAII, and the classic memory bugs (dangling pointers, shallow copies, iterator invalidation) that make hand-rolled data structures dangerous if you don't understand *why* they're dangerous.

## Prerequisites

**You need:** basic C++ syntax — variables, loops, functions, if `S-01-CPP-FOUNDATIONS` in this same folder feels shaky, do LAB-06 (Arrays and Memory) through LAB-09 (References) from that series first. Everything past that point, this series teaches from scratch, in-line, as it's needed.

**You do not need:** any prior DSA knowledge, any STL knowledge, or any prior C++ project experience.

## The Pedagogy

Every lab follows the same shape:

- **Quick Check** — three questions to answer before starting, so you notice what you don't yet know
- **What You Will Build** — the exact terminal output you're working toward
- **Concept** — what it is, the problem before it existed, the solution, a canonical example, and where the bug hides if you get it wrong
- **Steps** — numbered, each with a `SAVE AND TRY` you run before moving on — nothing is presented without you compiling and observing it yourself
- **Visualize** — most labs include an ASCII or memory-diagram visualization of what's actually happening in RAM, not just what the code says
- **Challenge** — an extension you build yourself, with a solution you check afterward, not before
- **Mental Model** table — wrong instinct vs. correct instinct, side by side
- **Final Check** — questions you should now be able to answer, checked against **Quick Check Answers**

Nothing is assumed. If a lab uses a language feature you haven't seen yet (a header file, an overloaded operator, a template), that lab teaches it before using it — never after.

## Lab Roadmap

### Module 1 — The Language Features DSA Needs

| Lab | Title | You Build | New Language Features |
|---|---|---|---|
| 01 | [Header Files and Compilation](CPP-S02-LAB-01-HEADERS-AND-COMPILATION.md) | A two-file project (`.h` + `.cpp`), compiled by hand | `#include`, header guards, declaration vs. definition, the compile/link model |
| 02 | [Classes, Structs, and Encapsulation](CPP-S02-LAB-02-CLASSES-AND-ENCAPSULATION.md) | A `BankAccount` class with private state | `class` vs `struct`, access specifiers, constructors, the `this` pointer |
| 03 | [Operator Overloading](CPP-S02-LAB-03-OPERATOR-OVERLOADING.md) | A `Fraction` class you can `+`, `==`, and `<<` like a built-in type | `operator<<`, `operator==`, `operator[]`, why overloading exists at all |
| 04 | [RAII, Destructors, and the Rule of Three](CPP-S02-LAB-04-RAII-AND-RULE-OF-THREE.md) | A `Buffer` class that owns raw memory safely | Destructors, copy constructor, copy assignment, why the default copy is dangerous |
| 05 | [Templates — Writing Code Once for Every Type](CPP-S02-LAB-05-TEMPLATES.md) | A generic `Box<T>` container | `template<typename T>`, compile-time instantiation, template errors |

### Module 2 — Linear Structures, Built By Hand

| Lab | Title | You Build | Core Concept |
|---|---|---|---|
| 06 | [Your Own Dynamic Array](CPP-S02-LAB-06-DYNAMIC-ARRAY.md) | `MyVector<T>` — resizing, growth strategy | Amortized growth, why `std::vector` doubles capacity |
| 07 | [Singly Linked Lists](CPP-S02-LAB-07-SINGLY-LINKED-LIST.md) | `MyLinkedList<T>` with visualized node links | Pointer chains, head/tail tracking, the null-check danger |
| 08 | [Doubly Linked Lists](CPP-S02-LAB-08-DOUBLY-LINKED-LIST.md) | Bidirectional list, insert/remove in O(1) | Two-pointer nodes, why doubly beats singly for deletion |
| 09 | [Stacks](CPP-S02-LAB-09-STACKS.md) | Array-backed and list-backed stack, a bracket-matcher | LIFO, when to prefer array vs. list backing |
| 10 | [Queues and Circular Buffers](CPP-S02-LAB-10-QUEUES-AND-CIRCULAR-BUFFERS.md) | FIFO queue, then a fixed-size circular buffer | FIFO, the naive-shift bug, modulo wraparound |

### Module 3 — Recursion and Trees

| Lab | Title | You Build | Core Concept |
|---|---|---|---|
| 11 | [Recursion and the Call Stack](CPP-S02-LAB-11-RECURSION-AND-CALL-STACK.md) | Factorial, Fibonacci, a visualized call-stack tracer | Base case, stack frames, stack overflow |
| 12 | [Binary Trees](CPP-S02-LAB-12-BINARY-TREES.md) | A binary tree with recursive traversals, visualized | Recursive structure, in/pre/post-order traversal |
| 13 | [Binary Search Trees](CPP-S02-LAB-13-BINARY-SEARCH-TREES.md) | A BST with insert/search/delete | The BST invariant, why an unbalanced BST degrades to O(n) |

### Module 4 — Hashing, Sorting, Searching

| Lab | Title | You Build | Core Concept |
|---|---|---|---|
| 14 | [Hash Tables From Scratch](CPP-S02-LAB-14-HASH-TABLES.md) | `MyHashMap<K,V>` with chaining | Hash functions, collisions, load factor, resizing |
| 15 | [Sorting Algorithms, Visualized](CPP-S02-LAB-15-SORTING-ALGORITHMS.md) | Bubble, insertion, merge, quick sort, swap-by-swap output | Comparison sorts, O(n²) vs O(n log n), stability |
| 16 | [Searching Algorithms](CPP-S02-LAB-16-SEARCHING-ALGORITHMS.md) | Linear search, binary search, and why binary needs sorted data | O(log n), the off-by-one danger in binary search |

### Module 5 — Graphs

| Lab | Title | You Build | Core Concept |
|---|---|---|---|
| 17 | [Graphs and Traversal](CPP-S02-LAB-17-GRAPHS-AND-TRAVERSAL.md) | An adjacency-list graph with BFS and DFS | Adjacency lists vs matrices, visited-set traversal |

### Module 6 — File I/O and the Dangers

| Lab | Title | You Build | Core Concept |
|---|---|---|---|
| 18 | [File I/O Fundamentals](CPP-S02-LAB-18-FILE-IO-FUNDAMENTALS.md) | Reading/writing structured records with `ifstream`/`ofstream` | Streams, `>>` on files, binary vs. text mode, RAII closing |
| 19 | [Building a File-Backed Searchable Database](CPP-S02-LAB-19-FILE-BACKED-DATABASE.md) | Load records from a file into an in-memory hash index, search by key | Combining LAB-14 + LAB-18 into one real tool |
| 20 | [The Danger Zone — Classic C++ Memory Bugs](CPP-S02-LAB-20-THE-DANGER-ZONE.md) | Deliberately reproduce and then fix 5 real bugs | Dangling pointers, shallow-copy double-free, iterator invalidation, off-by-one, memory leaks |

### Module 7 — Capstone

| Lab | Title | You Build |
|---|---|---|
| 21 | [Capstone — The In-Memory Record Store](CPP-S02-LAB-21-CAPSTONE.md) | A complete tool: load a file of records, index with your own hash table, search/sort/traverse with your own structures, zero leaks, zero dangling pointers, verified with the habits from LAB-20 |

## How Labs Connect

This series is cumulative in one specific way: **the language features from Module 1 are used, unexplained, everywhere after Module 1.** LAB-07's linked list uses the class/constructor patterns from LAB-02. LAB-14's hash table uses the templates from LAB-05. LAB-19's file-backed database directly reuses LAB-14's hash table and LAB-18's file streams without rebuilding either. By the capstone, nothing is new — it is entirely recombination of labs you've already built and understand.

## Start Here

[LAB-01 — Header Files and Compilation](CPP-S02-LAB-01-HEADERS-AND-COMPILATION.md)
