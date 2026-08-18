# Lesson 05: Doubly Linked List

**What you will build:** You will write isolated console programs that construct, traverse, and modify a doubly linked list from scratch, and then use the Standard Library's equivalent container. These programs demonstrate how adding a backward-pointing memory address solves the strict forward-only limitation of singly linked lists, enabling reverse traversal and instant node deletion.

**What you need to know first:** Lesson 04 Singly Linked List.

**Terms used in this lesson:**
- **Doubly Linked List** — A sequence of dynamically allocated nodes where each node contains two pointers: one to the next node and one to the previous node. *Why it exists:* To allow moving backward through the sequence and to allow operations at a specific node without having to search the entire list from the beginning to find its predecessor.
- **Predecessor** — The node that sits immediately before another node in a linked list. *Why it exists:* In linked list operations like insertion or deletion, you must update the predecessor's forward pointer to bridge the gap; a doubly linked list gives you immediate access to it.
- **Bidirectional Traversal** — The ability to step through a data structure from start to finish or from finish to start. *Why it exists:* Because many real-world systems (a browser's back/forward history, a music player's timeline) naturally require moving in both directions at will.

**Objects and methods used:**
- **`std::list<T>` / `push_back`**
  - *What it is:* The C++ Standard Library's implementation of a doubly linked list.
  - *Implementation:* `void push_back(const T& value);`
  - *Its use:* Appends an item to the end of the list, allocating a new node and wiring its `prev` and `next` pointers automatically.
- **`std::list<T>::iterator` / `--` operator**
  - *What it is:* A bidirectional iterator that points to a specific node within the `std::list`.
  - *Implementation:* `iterator& operator--();`
  - *Its use:* Moves the iterator backward to the predecessor node, an operation impossible with forward-only containers.
- **`std::list<T>` / `erase`**
  - *What it is:* A method to completely detach and destroy a node from the list.
  - *Implementation:* `iterator erase(const_iterator pos);`
  - *Its use:* Instantly removes the specific node pointed to by the iterator by rewiring its neighbors, without needing to scan the list to find it.

---

## Concept Unit: The `prev` Pointer

### The Problem
In a singly linked list, a node only knows what comes after it. If you hold a pointer to a specific node and need to know which node points to it, you are entirely out of luck. The only way to find out is to start back at the `head` of the list and traverse forward until you hit a node whose `next` pointer matches the one you hold. You need a data structure that remembers the past, not just the future.

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* next;
    Node* prev;
};

int main() {
    Node* a = new Node{10, nullptr, nullptr};
    Node* b = new Node{20, nullptr, nullptr};
    Node* c = new Node{30, nullptr, nullptr};

    // Forward links
    a->next = b;
    b->next = c;

    // Backward links
    c->prev = b;
    b->prev = a;

    std::cout << "Node B holds: " << b->data << "\n";
    std::cout << "Node B's predecessor holds: " << b->prev->data << "\n";
    std::cout << "Node B's successor holds: " << b->next->data << "\n";

    delete a; delete b; delete c;
    return 0;
}
```

### Mechanical Walkthrough
- `struct Node`: Defines the blueprint for our memory blocks.
- `Node* next;`: The familiar pointer holding the memory address of the succeeding node.
- `Node* prev;`: The new pointer holding the memory address of the predecessor node.
- `new Node{10, nullptr, nullptr};`: Allocates a node on the heap. We initialize both pointer fields to `nullptr` to be safe.
- `a->next = b;`: Wires the forward connection. Node A now knows B is next.
- `b->prev = a;`: Wires the backward connection. Node B now knows A is behind it.
- `b->prev->data`: Dereferences `b`, follows its `prev` pointer backward to `a`, and then reads the `data` field of `a`.

### CS Lens
This extra pointer fundamentally changes the time complexity of predecessor lookups from linear O(N) to constant O(1). However, it introduces a strict memory cost. On a 64-bit architecture, every memory address takes 8 bytes. A singly linked list node carrying a 4-byte `int` requires 12 bytes (often padded to 16). A doubly linked list node requires two 8-byte pointers plus the 4-byte integer, totaling 20 bytes (padded to 24). You are trading memory capacity for algorithmic speed.

### SE Lens
The tradeoff is manual management complexity. Every time a node joins or leaves the list, you must successfully update four pointers instead of two. Failing to update a `prev` pointer results in a corrupted data structure where walking forward gives a different sequence than walking backward.

### Run It Yourself
1. Save the code in `doubly_linked_demo.cpp`.
2. Compile: `g++ -std=c++17 doubly_linked_demo.cpp -o doubly_linked_demo`.
3. Run: `./doubly_linked_demo`.
4. Observe the output proving that node B can accurately "see" in both directions.

---

## Concept Unit: Bidirectional Traversal

### The Problem
Sometimes you need to process a sequence in reverse. If a user hits "undo" fifty times, your program must walk backward through fifty history states. A singly linked list requires you to write the entire list into an array first, or use deep recursion to print backwards. You need to iterate from the tail to the head efficiently.

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* next;
    Node* prev;
};

int main() {
    Node* a = new Node{1, nullptr, nullptr};
    Node* b = new Node{2, nullptr, nullptr};
    Node* c = new Node{3, nullptr, nullptr};

    a->next = b; b->prev = a;
    b->next = c; c->prev = b;

    Node* head = a;
    Node* tail = c;

    std::cout << "Forward traversal:\n";
    Node* curr = head;
    while (curr != nullptr) {
        std::cout << curr->data << " ";
        curr = curr->next;
    }

    std::cout << "\nBackward traversal:\n";
    curr = tail;
    while (curr != nullptr) {
        std::cout << curr->data << " ";
        curr = curr->prev;
    }
    std::cout << "\n";

    delete a; delete b; delete c;
    return 0;
}
```

### Mechanical Walkthrough
- `Node* head = a;`: A tracking pointer keeping hold of the front of the list, just like in a singly linked list.
- `Node* tail = c;`: A tracking pointer keeping hold of the absolute end of the list. Without this, you would have to traverse forward just to find where to start traversing backwards.
- `curr = tail;`: We begin our reverse iteration by pointing our cursor at the last node.
- `while (curr != nullptr)`: The loop condition remains the same as forward traversal. We continue until our pointer falls off the edge of the list into nowhere.
- `curr = curr->prev;`: The engine of the reverse loop. We replace our current address with the address stored in the `prev` pointer, effectively walking backward one step.

**Backward Execution Trace:**
1. `curr = tail` — Iteration begins pointing at node C (data `3`). The condition `curr != nullptr` passes.
2. `std::cout << curr->data` — Prints `3`.
3. `curr = curr->prev` — Reassigns the cursor backward, resolving C's `prev` pointer so `curr` now holds the address of node B.
4. Loop repeats — `curr` points to B (data `2`), prints `2`, and steps backward to node A.
5. Loop repeats — `curr` points to A (data `1`), prints `1`, and steps backward to `nullptr`.
6. Termination — `curr != nullptr` evaluates to false because `curr` is null, and the loop naturally halts.

### CS Lens
Bidirectional traversal in a doubly linked list is symmetrical. Iterating backward takes the exact same O(N) time as iterating forward. There is no performance penalty for traversing in reverse, unlike array-backed structures that might suffer minor cache-miss penalties when reading backwards depending on the CPU architecture.

### SE Lens
Maintaining a `tail` pointer is a classic engineering tradeoff. It requires another 8 bytes of storage for the list's control block, and it forces you to update `tail` every time an element is added to the absolute end. The benefit is completely avoiding an O(N) penalty whenever you need to jump to the back of the list.

### Run It Yourself
1. Save the code in `bidirectional_demo.cpp`.
2. Compile and run it.
3. Observe that the values `1 2 3` print forward, and instantly `3 2 1` print backward, all using the same data structure in place.

---

## Concept Unit: Insertion Without a Predecessor Search

### The Problem
Imagine you hold a pointer directly to node C, and you want to insert a new node X directly *before* it. In a singly linked list, you cannot do this. You have to start at `head`, loop until you find the node whose `next` points to C (which is B), and then insert X between B and C. If the list is a million items long, finding B takes linear time. You need to insert immediately.

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* next;
    Node* prev;
};

int main() {
    Node* b = new Node{20, nullptr, nullptr};
    Node* c = new Node{30, nullptr, nullptr};
    b->next = c; c->prev = b;

    // We only hold a pointer to c, but want to insert x before it.
    Node* target = c;
    Node* x = new Node{25, nullptr, nullptr};

    // The rewiring dance
    x->prev = target->prev;
    x->next = target;
    target->prev->next = x;
    target->prev = x;

    std::cout << "Sequence: " << b->data << " -> " 
              << b->next->data << " -> " 
              << b->next->next->data << "\n";

    delete b; delete x; delete c;
    return 0;
}
```

### Mechanical Walkthrough
- `Node* target = c;`: We have a pointer directly to the insertion site. We do not have a pointer to `b`.
- `x->prev = target->prev;`: Node X's backward pointer grabs onto whatever is currently behind C (which is B).
- `x->next = target;`: Node X's forward pointer grabs onto C. X is now fully wired, but the surrounding nodes still point past it.
- `target->prev->next = x;`: This is the crucial step. `target->prev` resolves to B. We then access B's `next` pointer, and point it at X. We updated B without ever explicitly searching for B.
- `target->prev = x;`: Finally, we update C's backward pointer to recognize X.

### CS Lens
This demonstrates an O(1) constant-time insertion operation. Because every node holds the exact memory address of its neighbors, you bypass the search algorithm entirely. No loop means the operation takes the exact same number of CPU cycles whether the list has ten items or ten million.

### SE Lens
The exact ordering of these four pointer reassignments is famously fragile. If you had executed `target->prev = x;` first, you would have permanently lost the backward pointer to B, making `target->prev->next = x;` crash the program. You must always wire the new node's pointers first, update the predecessor next, and update the target node last.

### Run It Yourself
1. Save the code in `insert_demo.cpp`.
2. Compile and run it.
3. Observe the output `20 -> 25 -> 30`, proving node X was successfully spliced between B and C.

---

## Concept Unit: Deletion Without a Predecessor Search

### The Problem
You need to delete node C from the list. To do so, you must bridge the gap by connecting node B directly to node D. In a singly linked list, you cannot do this without starting from the head to find B. In a doubly linked list, node C holds all the necessary addresses to remove itself from the chain.

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* next;
    Node* prev;
};

int main() {
    Node* b = new Node{20, nullptr, nullptr};
    Node* c = new Node{30, nullptr, nullptr};
    Node* d = new Node{40, nullptr, nullptr};

    b->next = c; c->prev = b;
    c->next = d; d->prev = c;

    Node* target = c;

    // Unlink target from the chain
    target->prev->next = target->next;
    target->next->prev = target->prev;

    // Destroy target
    delete target;

    std::cout << "Sequence: " << b->data << " -> " 
              << b->next->data << "\n";

    delete b; delete d;
    return 0;
}
```

### Mechanical Walkthrough
- `Node* target = c;`: We select the middle node for deletion.
- `target->prev->next = target->next;`: `target->prev` resolves to B. We assign B's `next` pointer to become D (`target->next`). B now points directly to D, bypassing C entirely.
- `target->next->prev = target->prev;`: `target->next` resolves to D. We assign D's `prev` pointer to become B (`target->prev`). D now points backward to B.
- `delete target;`: The node is unlinked, but it still consumes memory on the heap. We instruct the OS to reclaim it.

### CS Lens
This is an O(1) removal. It requires exactly two pointer reassignments and one memory deallocation. This is the primary reason operating systems use doubly linked lists internally to manage threads or timers: when a process exits unexpectedly, the OS can instantly pluck its node out of the middle of the active process queue.

### SE Lens
This implementation is minimal and unsafe. In a production system, you must check if `target->prev` is `nullptr` (meaning you are deleting the head) and if `target->next` is `nullptr` (meaning you are deleting the tail). If you blindly attempt `target->prev->next` when `prev` is null, your program will trigger a segmentation fault and crash.

### Run It Yourself
1. Save the code in `delete_demo.cpp`.
2. Compile and run it.
3. Observe the output `20 -> 40`, proving C was cleanly bridged over.

---

## Concept Unit: Standard Library `std::list`

### The Problem
Manually writing defensive pointer logic to handle every edge case (inserting at the head, deleting the tail, inserting into an empty list) requires hundreds of lines of code and is highly error-prone. The C++ Standard Library provides a pre-built, fully tested doubly linked list container that handles all of the raw pointer memory management safely.

### The New Code
```cpp
#include <iostream>
#include <list>

int main() {
    std::list<int> numbers;

    numbers.push_back(10);
    numbers.push_back(20);
    numbers.push_back(30);

    // Get an iterator to the end, then walk backwards to the 20
    std::list<int>::iterator it = numbers.end();
    --it; // now pointing at 30
    --it; // now pointing at 20

    // Erase the 20 instantly
    numbers.erase(it);

    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << "\n";

    return 0;
}
```

### Mechanical Walkthrough
- `#include <list>`: Instructs the compiler to include the definition for the `std::list` template.
- `std::list<int> numbers;`: Instantiates a doubly linked list holding integers. It internally manages its own `head`, `tail`, and `size`.
- `numbers.push_back(20);`: Allocates a new node, populates it with `20`, and securely wires it to the tail of the list.
- `std::list<int>::iterator it = numbers.end();`: Fetches an iterator representing the conceptual position *after* the last element.
- `--it;`: The pre-decrement operator. Because `std::list` iterators are bidirectional, applying `--` internally follows the `prev` pointer of the current node, safely moving the iterator backward one step.
- `numbers.erase(it);`: Calls the `erase` method, passing the exact position. The list executes the exact `prev` and `next` rewiring dance we did earlier, updates its internal size counter, and calls `delete` to prevent memory leaks.
- `for (int num : numbers)`: Range-based for loop. It automatically pulls `begin()` and `end()` iterators and walks forward using the hidden `next` pointers.

### CS Lens
The `std::list` container encapsulates the complexity of pointers behind a clean interface. However, because it relies on dynamically allocated nodes scattered across the heap, its cache locality is poor. This makes iterating through a `std::list` significantly slower in real-time execution than iterating through contiguous memory like a `std::vector`, despite both being O(N) algorithms.

### SE Lens
The alternative not chosen is using `std::vector` for everything. You only choose `std::list` if your program's dominant bottleneck is inserting or erasing items deeply embedded in the middle of a massive sequence, *and* you already possess iterators pointing directly to those locations. If you don't already have an iterator pointing there, you have to spend O(N) time finding the spot anyway, defeating the list's main advantage.

### Run It Yourself
1. Save the code in `std_list_demo.cpp`.
2. Compile: `g++ -std=c++17 std_list_demo.cpp -o std_list_demo`.
3. Run: `./std_list_demo`.
4. Observe the output `10 30`.

---

## Connect the Pieces

Imagine a web browser's history system. The browser maintains a doubly linked list of visited URLs. Every time you click a link, it allocates a new `Node`, wires its `prev` pointer to the current page, and advances the `tail`. When you click the "Back" button, the software executes `curr = curr->prev`, instantly loading the previous page. If you then visit a brand new site, the browser calls `std::list::erase` to delete all the "forward" nodes in constant time before appending the new page. The forward and backward pointers form the literal backbone of navigation.

## What Breaks Without This

If you try to move an iterator backward on a container that doesn't support bidirectional traversal, the compiler enforces the boundary. 

Modify the code to use `std::forward_list` (a singly linked list):
```cpp
#include <forward_list>

std::forward_list<int> numbers = {10, 20, 30};
auto it = numbers.end();
--it;
```

**The compiler error:**
`error: no match for 'operator--' (operand type is 'std::_Fwd_list_iterator<int>')`

Because `std::forward_list` nodes do not have `prev` pointers, its iterators literally do not have the capability to move backward. The compiler refuses to compile the program because the mathematical operation is impossible.

## Exercises

1. **Insert After:** Recreate the manual insertion code, but this time write the pointer logic to insert node X *after* a target node C instead of before it.
2. **Double Deletion:** Create a manual doubly linked list with 5 nodes. Hold pointers to nodes B and D. Delete both of them simultaneously and rewire the remaining nodes A, C, and E into a valid chain.
3. **List Splice:** Create two separate `std::list<int>` objects. Use the `std::list::splice` method (read its documentation) to transfer elements from the second list directly into the middle of the first list without allocating new nodes.

## Definition of Done

- [ ] You have manually wired a doubly linked list structure and proved it allows both `next` and `prev` traversal.
- [ ] You understand the order of operations required to insert a node without losing the predecessor reference.
- [ ] You can execute a constant-time node deletion by cleanly bypassing it.
- [ ] You have used `std::list` to perform these operations safely without raw `new` or `delete`.
- [ ] You can explain why `std::list` is advantageous over `std::vector` for middle-insertions, and why it is disadvantageous for general iteration.
