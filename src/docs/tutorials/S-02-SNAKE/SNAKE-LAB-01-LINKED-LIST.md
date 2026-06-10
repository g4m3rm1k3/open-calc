# C++ Masterclass — S-02 — LAB 01 — The Linked List: Building the Solution

**Prerequisites:** S-02 LAB 00. You felt O(n) movement cost with a fixed array.

**What this lab adds:**
- `new` and `delete` — allocating and freeing memory on the heap at runtime
- The heap vs the stack — two memory regions with fundamentally different lifetimes
- A `Node` struct — the atom of every linked list
- A singly linked list built from scratch — nodes connected by `next` pointers
- Prepend (add to front) in O(1) — the operation the array could not do cheaply
- Traversal — iterating a linked list without an index
- The destructor pattern — freeing heap memory before the list is destroyed

**Time:** ~80 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In S-01, you declared `int score = 100`. That variable lives on the **stack**.
>    What is the key difference between the stack and the heap?
> 2. LAB 00 showed that adding a segment to the front of an array requires shifting
>    every existing element. How many existing elements must move when you prepend
>    to a linked list?
> 3. Predict: If a linked list node stores a position (`row`, `col`) and a pointer
>    to the next node, what does the last node's `next` pointer hold?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **linked-list snake body** — replace the array from LAB 00 with a proper linked list.
Movement is now: prepend one node at the head, remove one node from the tail.
No shifting. Two pointer changes per frame regardless of snake length:

```
Frame 1 (length 3):
  [O]→[o]→[o]→nullptr
  Head at (4,10) → (4,11) → (4,12)

Frame 2 (still length 3, moved right):
  [O]→[o]→[o]→nullptr
  Head at (4,11) → (4,12) → (4,13)
  ← New head node created (O(1))
  ← Old tail node deleted (O(1))
  ← Zero elements shifted
```

After this lab, the movement loop that was 99 copies at length 100 becomes
**2 pointer operations** — always, at any length.

---

## Part 1 — The Heap: Memory That Outlives Its Scope

### Concept: The Heap — Runtime-Allocated Memory

**What it is:** The heap is a large pool of memory managed by the operating system
and your program's memory allocator. Unlike the stack (where `int score = 100` lives
and is destroyed when the function returns), heap memory:
- Is allocated at runtime with `new`
- Has no fixed size limit per allocation (up to available RAM)
- **Persists until explicitly freed with `delete`** — it does not vanish when a function returns
- Is identified only by a pointer — there is no name attached to it

**The stack vs the heap:**

```
Stack                              Heap
─────────────────────────────────  ──────────────────────────────────
Fixed size (~1–8 MB typical)       Limited only by available RAM
Allocated at compile time          Allocated at runtime with 'new'
Destroyed when scope exits         Destroyed only when 'delete' is called
Accessed by name (score, player)   Accessed only via pointer
Fast (just move the stack pointer) Slower (allocator must find free block)
```

**The problem that requires the heap:** A linked list of length N requires N nodes.
If N is only known at runtime (the player eats food), you cannot pre-allocate N nodes
on the stack — you don't know N at compile time. The heap solves this: allocate one
node at a time as needed.

**`new` — allocating one object on the heap:**
```cpp
int* p = new int(42);
//       ↑ allocates sizeof(int) bytes on the heap
//         initializes to 42
//         returns the address as int*
```

**`delete` — freeing that allocation:**
```cpp
delete p;   // frees the heap memory p points to
p = nullptr; // good practice: null the pointer so it cannot be accidentally reused
```

**`delete[]` for arrays:**
```cpp
int* arr = new int[10];   // allocate array on heap
delete[] arr;             // free the array — note the []
```
Using `delete` instead of `delete[]` for heap arrays is undefined behavior.

**The protected invariant:** Every `new` must have exactly one matching `delete`.
- Missing `delete`: **memory leak** — the allocation stays alive until the program exits,
  consuming RAM that cannot be reclaimed
- Double `delete`: **undefined behavior** — the allocator's metadata is corrupted,
  causing crashes or security vulnerabilities
- `delete` on a stack variable: **undefined behavior** — you did not allocate it

**Watch for:** Memory leaks do not crash your program immediately. They cause it to
consume ever-growing RAM over time. A game that leaks one node per frame at 60 FPS
leaks 60 nodes per second — invisible until the system runs out of memory.
AddressSanitizer (`-fsanitize=address`) catches leaks at program exit.

---

## Part 2 — The Node: One Link in the Chain

### Concept: `Node` — The Atom of a Linked List

**What it is:** A node is a struct that holds two things:
1. The **data** — whatever the list stores (for Snake: a grid position)
2. A **pointer to the next node** — the link that chains nodes together

```cpp
struct Node {
    int row  = 0;   // data: row position on the grid
    int col  = 0;   // data: column position on the grid
    Node* next = nullptr;   // link: address of the next node (nullptr = end of list)
};
```

**The chain:**
```
          ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
          │ row=4, col=10 │    │ row=4, col=9  │    │ row=4, col=8  │
          │ next ─────────┼───▶│ next ─────────┼───▶│ next = nullptr│
          └───────────────┘    └───────────────┘    └───────────────┘
               head                                       tail
```

**Why `Node* next` instead of `Node next`?**
`Node next` inside `Node` would be recursive — each Node contains a Node which
contains a Node... infinitely. The struct would have infinite size. `Node* next` stores
only a pointer (8 bytes) — a fixed size that points to a separate heap allocation.

**The canonical example — a train:**
Each train car (node) carries cargo (data) and is coupled to the next car (next pointer).
Adding a car at the front: connect the new car to the current front car, declare the
new car the new front. One coupling operation — O(1).

---

## Step 1 — Define the Node and Build a Three-Node List

New folder and `main.cpp` for this lab. Keep the S-02 folder, add a `lab01/` subfolder
with its own `main.cpp` and `Makefile`. Or update the same `main.cpp` — your choice.

For this lab, start fresh to study the list in isolation before integrating it into
the game:

```cpp
#include <iostream>    // std::cout, std::endl

// ── Node — one link in the snake body chain ───────────────────────────────────
struct Node {
    int   row  = 0;        // grid row of this segment
    int   col  = 0;        // grid column of this segment
    Node* next = nullptr;  // pointer to the segment behind this one (nullptr = tail)
};

// ── printList — traverse and print every node ─────────────────────────────────
// head: pointer to the first node; pass nullptr if the list is empty
void printList(const Node* head) {
    const Node* current = head;   // start at the head — do not move 'head' itself
    int index = 0;

    while (current != nullptr) {            // stop when we reach the end (nullptr)
        std::cout << "  [" << index << "] row=" << current->row
                  << " col=" << current->col << std::endl;
        current = current->next;            // advance to the next node
        ++index;
    }
    std::cout << "  (end of list)" << std::endl;
}

int main() {
    std::cout << "=== Linked List — Manual Three-Node Demo ===" << std::endl;
    std::cout << std::endl;

    // Allocate three nodes on the heap
    Node* n0 = new Node();   // head segment (leftmost)
    Node* n1 = new Node();
    Node* n2 = new Node();   // tail segment (rightmost)

    // Set positions
    n0->row = 4; n0->col = 10;   // head
    n1->row = 4; n1->col =  9;
    n2->row = 4; n2->col =  8;   // tail

    // Link the chain: head → n1 → n2 → nullptr
    n0->next = n1;
    n1->next = n2;
    n2->next = nullptr;   // already nullptr from default init — explicit for clarity

    std::cout << "Initial list (head to tail):" << std::endl;
    printList(n0);   // n0 is the head

    // Clean up — every 'new' must have a matching 'delete'
    delete n2;
    delete n1;
    delete n0;   // delete in reverse order is safe (they don't point at each other anymore)
    n0 = n1 = n2 = nullptr;

    return 0;
}
```

**`current->row` — the arrow operator:** When `current` is a pointer to a struct,
`current->row` accesses the `row` field of the struct it points to. It is shorthand
for `(*current).row` — dereference, then access. `->` is the standard way to access
struct members through a pointer.

**`const Node* head`:** The `const` here means "I will not modify the Node that
`head` points to." The pointer itself can change (advancing through the list).
This is different from `Node* const head` (the pointer cannot change but the Node can).

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
=== Linked List — Manual Three-Node Demo ===

Initial list (head to tail):
  [0] row=4 col=10
  [1] row=4 col=9
  [2] row=4 col=8
  (end of list)
```

**Change something:** Add `n0->next = n2; n2->next = n1;` after the initial chain
setup — creating `n0 → n2 → n1 → nullptr`. Run `printList`. The order changes.
Restore the original order before continuing.

---

## Part 3 — Prepend: O(1) Insert at the Head

### Concept: Prepend — O(1) Insert at the Front

**What it is:** Adding a new node before the current head. This is the operation
that was O(n) with an array (shift everything) and is O(1) with a linked list
(change two pointers).

**The two pointer steps:**
```
Before:  new_node          head → [n0] → [n1] → [n2] → nullptr
Step 1:  new_node->next = head  (new_node now points to old head)
Step 2:  head = new_node        (head pointer now points to new_node)
After:   head → [new_node] → [n0] → [n1] → [n2] → nullptr
```

**The cost:** Two pointer assignments. Regardless of the list's current length — 1
node or 1 million nodes — prepend is always exactly two operations. This is O(1).

**Contrast with array prepend:**
To add an element to the front of an array of N elements, every existing element
must shift one index to the right. That is N copies. The cost grows with N. This is O(N).

**The Snake movement connection:** Moving the snake forward is:
1. Prepend a new head node at the new position — O(1)
2. Remove the tail node — O(1) if we have a tail pointer
No loop. No copying. Constant time regardless of snake length.

---

## Step 2 — Prepend and Remove Tail

Add two functions before `main()`:

```cpp
// ── prepend — add a new node at the front of the list ────────────────────────
// head:    reference to the head pointer (will be updated to point to new node)
// newRow, newCol: position for the new segment
void prepend(Node*& head, int newRow, int newCol) {
    Node* newNode = new Node();   // allocate on the heap — survives after this function returns
    newNode->row  = newRow;
    newNode->col  = newCol;
    newNode->next = head;         // new node points to old head
    head          = newNode;      // head now points to new node
    // Total cost: 1 allocation + 2 pointer writes = O(1)
}

// ── removeTail — delete the last node in the list ────────────────────────────
// head:   reference to head pointer
// length: current length of the list
// Note: requires traversal to find the second-to-last node — O(n)
// (We will fix this in LAB 02 with a doubly linked list and a tail pointer)
void removeTail(Node*& head, int length) {
    if (head == nullptr) return;   // empty list — nothing to remove

    if (length == 1) {             // only one node — removing it empties the list
        delete head;
        head = nullptr;
        return;
    }

    // Traverse to the second-to-last node
    Node* current = head;
    for (int i = 0; i < length - 2; ++i) {   // stop at the node BEFORE the tail
        current = current->next;
    }
    // current is now the second-to-last node
    delete current->next;     // free the tail
    current->next = nullptr;  // second-to-last becomes the new tail
}
```

**`Node*& head` — reference to a pointer:**
`head` is a pointer. `Node*&` is a **reference to that pointer**. Without the `&`,
`prepend` would receive a copy of the pointer — changing `head` inside the function
would not affect the caller's pointer. With `&`, the caller's pointer is updated
directly. This is the same pass-by-reference concept from S-01 LAB 09, applied to
a pointer type.

---

## Step 3 — Simulate Snake Movement

Replace `main()` to simulate 5 frames of movement:

```cpp
int main() {
    std::cout << "=== Linked List Snake Movement Simulation ===" << std::endl;
    std::cout << std::endl;

    // Initial snake: 3 segments, moving right along row 4
    Node* head = nullptr;
    int   length = 3;

    // Build initial body using prepend (added right-to-left so head ends up leftmost)
    prepend(head, 4, 10);   // tail (added first — will be last)
    prepend(head, 4, 11);   // middle
    prepend(head, 4, 12);   // head (added last — will be first)

    std::cout << "Initial state (length " << length << "):" << std::endl;
    printList(head);
    std::cout << std::endl;

    // Simulate 5 frames moving right
    for (int frame = 1; frame <= 5; ++frame) {
        // New head position: same row, one column to the right of current head
        int newRow = head->row;
        int newCol = head->col + 1;

        prepend(head, newRow, newCol);   // O(1): add new head
        ++length;
        removeTail(head, length);        // O(n): remove old tail — we fix this in LAB 02
        --length;

        std::cout << "Frame " << frame << " (moved right):" << std::endl;
        printList(head);
        std::cout << std::endl;
    }

    // Clean up all nodes
    Node* current = head;
    while (current != nullptr) {
        Node* next = current->next;   // save next BEFORE deleting current
        delete current;
        current = next;
    }
    head = nullptr;

    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** The snake slides right across the grid — each frame, the head
column increases by 1 and the tail column increases by 1. The list always has 3 nodes.

**Observe:** `prepend` is O(1) — two pointer writes. `removeTail` is O(n) — it
traverses to the second-to-last node. In LAB 02, adding a `tail` pointer to the
list eliminates this traversal, making both operations O(1).

---

## Part 4 — Big-O: Formalizing What You Already Know

### Math: Big-O Notation — Describing How Cost Scales

**What it computes:** Big-O notation describes how the number of operations an
algorithm performs grows as the input size (N) grows. It ignores constant factors
and lower-order terms — it captures the **shape** of the growth.

**The formal definition:** f(N) is O(g(N)) if there exist constants c and N₀ such
that for all N > N₀, f(N) ≤ c × g(N). In plain English: for large enough inputs,
f(N) grows no faster than g(N) times some constant.

**The classes you need now:**

| Notation | Name | Example | What it means |
|----------|------|---------|---------------|
| O(1) | Constant | Prepend to linked list | Cost does not change as N grows |
| O(n) | Linear | Array shift, list traversal | Cost grows proportionally with N |
| O(n²) | Quadratic | Nested loop over N elements | Cost grows as N² |
| O(log n) | Logarithmic | Binary search | Cost grows slowly even for large N |

**The real-world analogy — a phone book:**
- O(1): Lookup by exact page number — flip to page 50, cost is the same regardless of book size
- O(n): Read every entry to find a name — 1000 entries = 1000 reads; 2000 entries = 2000 reads
- O(log n): Binary search — open to the middle, decide which half, repeat. 1000 entries: ~10 steps; 2000 entries: ~11 steps

**Why it matters for Snake specifically:**
At length 10, the array shift takes 9 copies. At length 100, it takes 99. At length
200 (a full 20×10 grid), it takes 199 copies. With a linked list, it is always 2
pointer operations. The difference is invisible at length 10 — and catastrophic at length 200.

**Watch for:** O(1) does not mean "one operation." It means "a constant number of
operations that does not change with N." Prepend actually does 4 operations (allocate,
set row, set col, update head) — but that count never changes as the list grows.

---

## 🎯 Challenge: Count the Operations

**You know:** Linked list traversal, `prepend`, `removeTail`.

**Task:** Add operation counters to `prepend` and `removeTail`. Each function takes
a `int& opCount` parameter and increments it for every pointer write or comparison.
Grow the snake to length 20 by simulating food collection. Print the total operation
count for both functions after every 5 segments of growth.

Observe how `prepend`'s count per call stays constant while `removeTail`'s grows.

---

<details>
<summary>▶ Show Solution — Key Part</summary>

```cpp
void prepend(Node*& head, int newRow, int newCol, int& opCount) {
    Node* newNode = new Node();
    newNode->row  = newRow;   ++opCount;
    newNode->col  = newCol;   ++opCount;
    newNode->next = head;     ++opCount;
    head          = newNode;  ++opCount;
    // Always 4 ops — O(1)
}

void removeTail(Node*& head, int length, int& opCount) {
    // ...traversal loop...
    for (int i = 0; i < length - 2; ++i) {
        current = current->next;
        ++opCount;   // one pointer follow per step
    }
    // Total ops = length - 1 — O(n)
}
```

**What you will see:** At length 5, `removeTail` does 4 pointer follows.
At length 10, it does 9. At length 20, it does 19. `prepend` stays at 4 forever.
In LAB 02, a tail pointer reduces `removeTail` to 4 operations too.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| Three-node list prints | Output shows row/col of all 3 nodes in order |
| `new` allocates on heap | Nodes created inside `prepend` persist after the function returns |
| `prepend` updates head | After `prepend(head,...)`, `head` points to the new node |
| Movement simulation | Each frame the head column increases by 1; tail column follows |
| `removeTail` frees memory | ASan (`-fsanitize=address`) shows no leak after `removeTail` |
| Final cleanup loop | All nodes deleted; no memory leak at program exit |
| `->` operator | `current->row` correctly accesses the node's field through the pointer |

---

## Quick Check Answers

**1. Key difference between the stack and the heap?**
The stack is automatically managed — variables are allocated when their scope is entered
and freed when it exits. The heap requires manual management — you call `new` to allocate
and `delete` to free. The stack is fast but limited in size (~1–8 MB). The heap is
slower but can hold gigabytes. Most importantly: heap memory persists until `delete`
is called, even if the allocating function has returned. This is required for linked list
nodes that must outlive the function that created them.

**2. How many elements must move when you prepend to a linked list?**
Zero. Prepend to a linked list requires exactly two pointer changes:
1. `newNode->next = head` (point new node at old head)
2. `head = newNode` (move the head pointer to new node)
No existing nodes are touched. No data is copied. The operation is O(1) regardless
of the list's current length.

**3. What does the last node's `next` pointer hold?**
`nullptr`. The `nullptr` at the end of the chain is the sentinel value that signals
"there is no next node." Traversal loops use `while (current != nullptr)` — they stop
when they reach a node whose `next` is `nullptr`, which is the tail node.
Without this sentinel, the traversal would follow garbage memory and crash.
