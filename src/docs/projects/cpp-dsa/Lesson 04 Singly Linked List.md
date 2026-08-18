# Lesson 04: Singly Linked List

**What you will build:** You will write isolated console programs to implement a singly linked list from scratch using raw pointers. These programs demonstrate how to allocate independent nodes scattered in memory and link them together. The transferable problem this solves is avoiding the O(n) cost of resizing or shifting elements in a contiguous array—trading O(n) access time to gain O(1) insertions at the head.

**What you need to know first:** C++ From Scratch (Lessons 01–35 complete).

**Terms used in this lesson:**
- **Singly Linked List** — A data structure consisting of independent nodes where each node holds a value and a pointer to the next node in the sequence. *Why it exists:* To allow O(1) insertions or deletions at specific points without shifting elements in memory.
- **Node** — A discrete block of memory storing a single element's data and the structural pointer(s). *Why it exists:* To decouple the data's logical order from its physical layout in RAM.
- **Head Pointer** — A raw pointer that stores the memory address of the very first node in the list. *Why it exists:* It serves as the sole entry point to the entire data structure; without it, the entire list is lost and becomes a memory leak.
- **Traversal** — The act of sequentially following the next pointers from the head to the end of the list. *Why it exists:* Because nodes are scattered randomly in memory, direct index math (like `array[5]`) is impossible, forcing you to walk the chain one link at a time.

**Objects and methods used:**
- **`std::forward_list<T>` / `push_front`**
  - *What it is:* The C++ Standard Library's implementation of a singly linked list.
  - *Implementation:* `void push_front(const T& val);`
  - *Its use:* Inserts a new element at the very beginning of the list, automatically managing the underlying node allocation and pointer wiring.

---

## Concept Unit: Node Structure and Manual Links

### The Problem
Dynamic arrays like `std::vector` require contiguous memory. If you insert an element at the very front of a one-million-element vector, the computer must shift all one million existing elements down by one slot in RAM—an O(n) operation. You need a way to store sequential data where inserting a new item requires only shuffling a couple of pointers, without moving any existing data.

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* next;
};

int main() {
    Node* head = new Node{10, nullptr};
    Node* second = new Node{20, nullptr};
    Node* third = new Node{30, nullptr};

    head->next = second;
    second->next = third;

    std::cout << "Head data: " << head->data << "\n";
    std::cout << "Second data: " << head->next->data << "\n";
    
    delete head;
    delete second;
    delete third;
    
    return 0;
}
```

### Mechanical Walkthrough
- `struct Node {`: Defines a custom data type. Unlike a class, a struct's members are public by default, which is conventional for raw data nodes.
- `int data;`: The actual payload this node holds.
- `Node* next;`: A pointer holding the memory address of another `Node`. This is a self-referential structure.
- `Node* head = new Node{10, nullptr};`: Dynamically allocates a new `Node` on the heap. Its `data` is `10`, and its `next` pointer is explicitly set to `nullptr` (pointing at nothing). Returns the address to `head`.
- `head->next = second;`: Accesses the `next` pointer inside the first node and overwrites its `nullptr` with the memory address of `second`. The two nodes are now logically connected.
- `head->next->data`: Resolves the `head` pointer to find the first node, accesses its `next` pointer to find the second node, and finally reads the `data` payload of the second node.
- `delete head;`: Manually returns the heap-allocated memory to the operating system. Each node must be deleted individually because they are separate allocations.

### CS Lens
This is the foundational definition of a linked list. By embedding the "next" location directly alongside the data, the structure sacrifices physical contiguity. The computer cannot predict where `second` is based on where `head` is located in RAM.

### SE Lens
The alternative not chosen is a contiguous array block (`new int[3]`). The tradeoff is overhead: an array of three integers takes exactly 12 bytes. This linked list takes 48 bytes on a 64-bit system (4 bytes for the int + 4 bytes padding + 8 bytes for the pointer, per node), massively increasing memory footprint and destroying CPU cache locality, all to buy structural flexibility.

### Run It Yourself
1. Save the code in `manual_links.cpp`.
2. Compile: `g++ -std=c++17 manual_links.cpp -o manual_links`.
3. Run: `./manual_links`.
4. Observe the output:
   Head data: 10
   Second data: 20

---

## Concept Unit: Traversal

### The Problem
In the manual example above, printing the third node would require `head->next->next->data`. If a list has a million nodes, you cannot hardcode a million arrow operators. Because the nodes are not stored sequentially in memory, you cannot use pointer arithmetic (`head + 5`). You need an algorithmic way to visit every node dynamically.

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* next;
};

int main() {
    Node* head = new Node{10, new Node{20, new Node{30, nullptr}}};

    Node* current = head;
    while (current != nullptr) {
        std::cout << current->data << "\n";
        current = current->next;
    }

    // Cleanup
    current = head;
    while (current != nullptr) {
        Node* nextNode = current->next;
        delete current;
        current = nextNode;
    }

    return 0;
}
```

### Mechanical Walkthrough
- `new Node{10, new Node{...}}`: Inline allocations that immediately use the newly returned pointer as the `next` value for the previous node. This compactly builds the list.
- `Node* current = head;`: Creates a temporary local pointer. This is the "cursor" that will walk the list. We never modify `head` directly; doing so would cause us to permanently lose the start of the list.
- `while (current != nullptr)`: The loop condition. A valid linked list must always be terminated by a node whose `next` is `nullptr`. When `current` becomes `nullptr`, we have walked off the end of the chain.
- `current = current->next;`: The core traversal mechanic. It reads the address stored inside the current node's `next` field and overwrites the `current` variable with it, advancing the cursor down the chain.
- `Node* nextNode = current->next;` (in cleanup): Before deleting the current node, we must aggressively rescue its `next` pointer into a temporary variable. If we ran `delete current;` first, accessing `current->next` on the next line would read freed memory (a use-after-free bug).

### CS Lens
This loop demonstrates why access in a linked list is always O(n). To read the 500th element, you have absolutely no choice but to visit elements 1 through 499 first to discover the address of the 500th. This sequential bottleneck is the structural penalty paid for scattered allocations.

### SE Lens
The alternative not chosen is storing a dedicated `size` integer variable and using a `for` loop from `0` to `size`. While many real-world list classes do track size, a `while(current != nullptr)` loop is the only way to traverse a raw chain directly based on its inherent physical layout, remaining completely safe even if a separate `size` variable were to fall out of sync.

### Run It Yourself
1. Save the code in `traversal.cpp`.
2. Compile: `g++ -std=c++17 traversal.cpp -o traversal`.
3. Run: `./traversal`.
4. Observe the output: 10, 20, 30 printed on separate lines.

---

## Concept Unit: Insertion at Head and Tail

### The Problem
The primary advantage of a linked list is its ability to grow dynamically. We need to add a new node to the front of the list (an operation that takes O(n) in a vector) and add a node to the very end of the list.

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* next;
};

void insertAtHead(Node*& head, int value) {
    Node* newNode = new Node{value, head};
    head = newNode;
}

void insertAtTail(Node* head, int value) {
    if (head == nullptr) return; // Normally you'd handle this, skipped for brevity
    
    Node* current = head;
    while (current->next != nullptr) {
        current = current->next;
    }
    current->next = new Node{value, nullptr};
}

int main() {
    Node* head = new Node{20, nullptr};
    
    insertAtHead(head, 10);
    insertAtTail(head, 30);
    
    for (Node* curr = head; curr != nullptr; curr = curr->next) {
        std::cout << curr->data << "\n";
    }
    
    // Cleanup skipped in this example for brevity
    return 0;
}
```

### Mechanical Walkthrough
- `void insertAtHead(Node*& head, int value)`: Takes `head` as a pointer passed by reference. This is critical. Because we are changing what the `head` pointer itself points to (re-aiming it at the new node), the caller's variable must be modified. If passed by value, we would only modify a local copy of the pointer.
- `Node* newNode = new Node{value, head};`: Allocates the new node. Crucially, its `next` pointer is initialized to the *current* `head`. The new node now reaches out and grabs the existing list.
- `head = newNode;`: Updates the main tracking pointer to point at the new first element. This entire operation is O(1) constant time, requiring exactly one allocation and one pointer assignment, regardless of whether the list has one node or one billion nodes.
- `while (current->next != nullptr)`: In `insertAtTail`, the loop checks `current->next`, not `current`. We must stop *on* the last actual node, so we can modify its `next` field. If we looped until `current != nullptr`, we would fall completely off the chain and have no node left to attach the new allocation to.
- `current->next = new Node{...}`: Having reached the last node (whose `next` is currently `nullptr`), we allocate a new node and assign its address here.

### CS Lens
Notice the stark asymmetry. `insertAtHead` is an O(1) operation because we hold a direct pointer to the front. `insertAtTail` is an O(n) operation here because we are forced to traverse the entire list just to find the end. Many real-world implementations solve this by maintaining a secondary `tail` pointer alongside `head`.

### SE Lens
The alternative not chosen is copying the entire list into a new, larger structure, which is how contiguous arrays resize. The tradeoff is that linked list nodes must be dynamically allocated one by one via `new`, hitting the heap allocator repeatedly. In performance-critical C++, hitting the heap allocator for every single integer is drastically slower than bulk-allocating a vector once, making linked lists rarely the right choice for small, primitive data types.

### Run It Yourself
1. Save the code in `insertion.cpp`.
2. Compile: `g++ -std=c++17 insertion.cpp -o insertion`.
3. Run: `./insertion`.
4. Observe the output: 10, 20, 30.

---

## Concept Unit: Deletion

### The Problem
When you want to remove an element, you cannot simply `delete` it. If you delete a node in the middle of a list, the node before it still holds the dead memory address, and the node after it is completely detached and leaked. You must patch the chain together before destroying the target node.

### The New Code
```cpp
#include <iostream>

struct Node {
    int data;
    Node* next;
};

void deleteHead(Node*& head) {
    if (head == nullptr) return;
    Node* oldHead = head;
    head = head->next;
    delete oldHead;
}

void deleteAfter(Node* prevNode) {
    if (prevNode == nullptr || prevNode->next == nullptr) return;
    Node* nodeToDelete = prevNode->next;
    prevNode->next = nodeToDelete->next;
    delete nodeToDelete;
}

int main() {
    Node* head = new Node{10, new Node{20, new Node{30, nullptr}}};
    
    deleteAfter(head); // Deletes the 20
    deleteHead(head);  // Deletes the 10
    
    std::cout << "Remaining: " << head->data << "\n";
    
    delete head;
    return 0;
}
```

### Mechanical Walkthrough
- `Node* oldHead = head;`: Before changing the `head` pointer, we securely stash its current address. If we re-aimed `head` first without doing this, we would lose the only reference to the allocation we need to destroy.
- `head = head->next;`: Re-aims the main list pointer to point at the second node, completely abandoning the first node from the list logic.
- `delete oldHead;`: Now that the chain logic is safe, we physically destroy the heap allocation.
- `Node* nodeToDelete = prevNode->next;`: In `deleteAfter`, we identify the exact memory we plan to destroy.
- `prevNode->next = nodeToDelete->next;`: The core surgical patch. It bypasses `nodeToDelete` entirely, wiring the previous node directly to the node that comes *after* the one being deleted. The target node is now isolated from the chain.
- `delete nodeToDelete;`: Frees the isolated memory.

### CS Lens
Deleting a known node in a linked list is O(1) pointer surgery. However, discovering *which* node to delete (e.g., "delete the node with value 20") requires an O(n) traversal first. 

### SE Lens
The alternative not chosen is shifting elements down to fill the gap (as in an array deletion). The linked list bypasses the node instantly, trading memory locality for zero-copy removal logic.

### Run It Yourself
1. Save the code in `deletion.cpp`.
2. Compile: `g++ -std=c++17 deletion.cpp -o deletion`.
3. Run: `./deletion`.
4. Observe the output: "Remaining: 30".

---

## Concept Unit: `std::forward_list`

### The Problem
Writing raw manual pointer logic (`next`, `new`, `delete`) in every project is extremely dangerous. One missing temporary variable results in a use-after-free, a memory leak, or a broken chain. The C++ Standard Library provides a rigorously tested template class that wraps all of this raw pointer surgery behind a safe, standard interface.

### The New Code
```cpp
#include <iostream>
#include <forward_list>

int main() {
    std::forward_list<int> list;
    
    list.push_front(30);
    list.push_front(20);
    list.push_front(10);
    
    list.pop_front();
    
    for (int value : list) {
        std::cout << value << "\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <forward_list>`: Instructs the compiler to include the definition for the singly linked list template.
- `std::forward_list<int> list;`: Instantiates an empty singly linked list. Behind the scenes, its internal head pointer is initialized to `nullptr`.
- `list.push_front(30);`: Automatically allocates a new internal node struct on the heap, places `30` in it, wires its next pointer to the current head, and updates the head. Exactly the same logic as our manual `insertAtHead`, but completely encapsulated.
- `list.pop_front();`: Automatically handles the `oldHead` rescue, head advance, and safe `delete` operation we built in `deleteHead`.
- `for (int value : list)`: A range-based for loop. It asks the `forward_list` for an iterator (which internally wraps a `Node*`), dereferences it to get the integer payload, and advances it by calling `current = current->next` inside the iterator's `operator++`.

### CS Lens
`std::forward_list` is unique in the Standard Library because it intentionally omits a `size()` method. To compute its size would require an O(n) traversal. The C++ committee chose not to maintain a hidden `size` variable inside the object to ensure `std::forward_list` has exactly the same minimal memory overhead (one raw pointer for the head) as a hand-rolled C-style linked list.

### SE Lens
The alternative not chosen is `std::list`, which is a doubly linked list (each node has a `prev` and `next` pointer). You choose `std::forward_list` when memory footprint is absolutely critical and you exclusively need to iterate purely forward from start to finish.

### Run It Yourself
1. Save the code in `forward_list_demo.cpp`.
2. Compile: `g++ -std=c++17 forward_list_demo.cpp -o forward_list`.
3. Run: `./forward_list`.
4. Observe the output:
   20
   30

---

## Connect the Pieces

Observe the lifecycle of memory. When you build the structure raw, you act as the memory manager—every `new Node` necessitates a `delete`, and skipping one creates a silent memory leak that grows over time. When you use `std::forward_list`, the moment it falls out of scope at the end of `main`, its destructor silently executes the exact `while (current != nullptr)` cleanup loop we wrote in Unit 2, safely destroying every node for you. 

## What Breaks Without This

If you fail to properly stash the `next` pointer before deleting a node during a traversal cleanup, your program will crash entirely.

Modify the cleanup loop in Unit 2 to be structurally naive:
```cpp
Node* current = head;
while (current != nullptr) {
    delete current;
    current = current->next; // CRASH
}
```

**The compiler error/runtime failure:**
This compiles successfully, but triggers undefined behavior at runtime (often a segfault). Because `current` was just handed back to the OS via `delete`, accessing `current->next` on the immediate next line attempts to read memory that you no longer own. The required pointer surgery is unforgiving.

## Exercises

1. **Sum the List:** In the manual traversal code, declare an `int sum = 0;` before the loop. Inside the loop, add `current->data` to the sum instead of printing it. Print the final sum at the end.
2. **Search the Chain:** Write a function `bool contains(Node* head, int target)` that traverses the list and returns `true` the moment it finds a node where `data == target`.
3. **Insert After:** Read about `std::forward_list::insert_after`. Use it to insert the number `25` immediately after the first element in a `std::forward_list`.

## Definition of Done

- [ ] You have manually built a linked list using `new Node{}` and wired the pointers together by hand.
- [ ] You have traversed a chain using a `while(current != nullptr)` loop.
- [ ] You can explain out loud why `insertAtHead` is an O(1) constant-time operation.
- [ ] You understand why safely deleting a node requires temporary pointer variables.
- [ ] You have successfully compiled and run an equivalent `std::forward_list` operation.
