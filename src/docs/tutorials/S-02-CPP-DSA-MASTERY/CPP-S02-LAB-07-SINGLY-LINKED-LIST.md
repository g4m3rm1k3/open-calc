# CPP DSA — LAB-07 — Singly Linked Lists

**Prerequisites:** LAB-06 (Your Own Dynamic Array)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Unlike `MyVector`'s single contiguous block of memory, where does each element of a linked list actually live in memory?
2. Why is inserting at the *front* of a linked list O(1), while inserting at the front of `MyVector` is O(n)?
3. What happens if you follow a node's `next` pointer without first checking whether it's `nullptr`?

## What You Will Build

`MyLinkedList<T>` — a singly linked list built from individually heap-allocated `Node` structs chained together by pointers, with a visualized trace of the pointer chain after every insertion, and a correct destructor that walks the whole chain freeing every node (the one place a linked list's cleanup is genuinely more involved than `MyVector`'s single `delete[]`).

```
$ ./list_demo
push_front(3): [3] -> nullptr
push_front(2): [2] -> [3] -> nullptr
push_front(1): [1] -> [2] -> [3] -> nullptr
push_back(4):  [1] -> [2] -> [3] -> [4] -> nullptr
List destroyed -- freed 4 nodes
```

## Concept: Nodes and Pointer Chains — Memory That Isn't Contiguous

**What it is:** A linked list stores each element in its own separately heap-allocated `Node`, and each `Node` holds both a value *and* a pointer to the *next* `Node` in the sequence. The list itself just holds a pointer to the first node (`head`) — everything else is reached by following `next` pointers, one hop at a time. Unlike `MyVector`'s one contiguous block of memory, a linked list's nodes can live at completely unrelated addresses scattered across the heap — the *chain of pointers*, not physical adjacency, is what defines the order.

**The problem before:** `MyVector` (LAB-06) is excellent for indexed access (`vec[5]` is instant — jump directly to that memory offset) but inserting at the *front* is expensive: every existing element has to shift one slot to the right to make room, an O(n) operation. Some use cases need frequent front-insertion or frequent insertion/removal in the middle, where shifting a whole contiguous array every time is wasteful.

**The solution:** Don't store elements contiguously at all — store each one in its own node, and let pointers define the order instead of physical position. Inserting at the front becomes: allocate one new node, point its `next` at the current first node, and update `head` to point at the new node — three pointer operations, O(1), regardless of how many elements are already in the list. The trade-off (there always is one): indexed access (`list.get(5)`) now requires walking the chain one hop at a time from `head`, an O(n) operation — the exact opposite trade-off profile from `MyVector`.

**Canonical example:**

```cpp
template<typename T>
struct Node {
    T value;
    Node* next;
    Node(T v) : value(v), next(nullptr) {}
};

template<typename T>
class MyLinkedList {
private:
    Node<T>* head;
public:
    void push_front(T value) {
        Node<T>* newNode = new Node<T>(value);
        newNode->next = head;
        head = newNode;
    }
};
```

**Project Application:** LAB-09's stack and LAB-10's queue both offer a linked-list-backed implementation as an alternative to an array-backed one — this lab's `Node`/pointer-chain pattern is the foundation both reuse directly. LAB-14's hash table uses the same `Node` idea for chaining collisions within a single bucket.

**Watch for:** Following `node->next` without checking `node != nullptr` first. The last node in any chain has `next == nullptr` by design (it marks "there's nothing after this") — dereferencing a `nullptr` (`nullptr->value`, `nullptr->next`) is undefined behavior and typically crashes immediately with a segmentation fault. Every loop that walks a linked list needs a `while (current != nullptr)` guard, without exception.

## Step 1: The `Node` struct

```cpp
// MyLinkedList.h -- top of file
#ifndef MY_LINKED_LIST_H
#define MY_LINKED_LIST_H

template<typename T>
struct Node {
    T value;
    Node* next;
    Node(T v) : value(v), next(nullptr) {}
};
```

`struct` (not `class`) is used here deliberately, following LAB-02's convention: `Node` is a plain data bundle with no encapsulation needed — the linked list class itself is the only code that ever touches a `Node` directly, so there's no outside code to protect it from. `next(nullptr)` in the constructor's initializer list matters: a freshly created node always starts pointing at nothing, and it's the *inserting* code's job (Step 2) to correctly link it into the chain — never assume a `next` pointer starts pointing somewhere useful.

### SAVE AND TRY

```cpp
Node<int>* single = new Node<int>(42);
std::cout << "value: " << single->value << ", next: " << single->next << "\n";
// value: 42, next: 0  (or "0x0" -- the printed form of nullptr, platform-dependent)
delete single;
```

Confirm `next` prints as a null address — direct proof the constructor correctly initialized it, before any linking has happened.

## Step 2: `MyLinkedList` — the class, and `push_front`

```cpp
template<typename T>
class MyLinkedList {
private:
    Node<T>* head;
    int size;

public:
    MyLinkedList() : head(nullptr), size(0) {}
    ~MyLinkedList();

    void push_front(T value);
    int getSize() const { return size; }
    void print() const;
};

template<typename T>
void MyLinkedList<T>::push_front(T value) {
    Node<T>* newNode = new Node<T>(value);
    newNode->next = head; // step 1: point the new node at the CURRENT first node
    head = newNode;        // step 2: THEN update head to point at the new node
    size++;
}
```

The order of those two lines inside `push_front` is not arbitrary — `newNode->next = head;` must happen *before* `head = newNode;`. If reversed, `head` would already point at `newNode` by the time `newNode->next = head;` ran, making `newNode->next` point at *itself* — losing the entire rest of the list and creating a one-node cycle. This exact ordering dependency (read the old value before overwriting the variable that held it) is one of the most common places to introduce a subtle bug when first writing linked-list code.

### SAVE AND TRY

```cpp
MyLinkedList<int> list;
list.push_front(3);
list.push_front(2);
list.push_front(1);
// list should now be: 1 -> 2 -> 3 -> nullptr
```

As an experiment, deliberately swap the two lines inside `push_front` (assign `head = newNode;` first, *then* `newNode->next = head;`), rebuild, and run the same three pushes — then try to print the list (Step 3) and observe what actually happens (likely: only `1` printed forever, or a crash, depending on how the bug manifests) — a concrete demonstration of why line order matters here.

## Step 3: Visualizing the chain — a `print()` method that walks it

```cpp
template<typename T>
void MyLinkedList<T>::print() const {
    Node<T>* current = head;
    std::cout << "[";
    bool first = true;
    while (current != nullptr) { // THE null check -- every list-walking loop needs this
        if (!first) std::cout << "] -> [";
        std::cout << current->value;
        first = false;
        current = current->next; // advance one hop
    }
    std::cout << "] -> nullptr\n";
}
```

`current` is a *local* pointer variable used to walk the chain — critically, `print()` never modifies `head` itself, only its own local `current` copy of that starting address. This is the standard pattern for reading a linked list: never move the list's own `head`/`tail` pointers during a read-only traversal, always walk with a separate local variable, so the list itself is left exactly as it was found once the loop finishes.

### SAVE AND TRY

```cpp
MyLinkedList<int> list;
list.push_front(3);
list.print(); // [3] -> nullptr
list.push_front(2);
list.print(); // [2] -> [3] -> nullptr
list.push_front(1);
list.print(); // [1] -> [2] -> [3] -> nullptr
```

Confirm each print matches "What You Will Build" at the top of this lab — this is the visualization the concept section promised: watching the chain grow, one link at a time, printed after every single insertion.

## Step 4: `push_back` and the destructor — walking to the end, and freeing every node

```cpp
template<typename T>
class MyLinkedList {
    // ...add to public section...
    void push_back(T value);
};

template<typename T>
void MyLinkedList<T>::push_back(T value) {
    Node<T>* newNode = new Node<T>(value);
    if (head == nullptr) { // special case: empty list, new node BECOMES head
        head = newNode;
        size++;
        return;
    }
    Node<T>* current = head;
    while (current->next != nullptr) { // walk until the LAST node (the one whose next IS nullptr)
        current = current->next;
    }
    current->next = newNode; // link the last node to the new one
    size++;
}

template<typename T>
MyLinkedList<T>::~MyLinkedList() {
    Node<T>* current = head;
    while (current != nullptr) {
        Node<T>* next = current->next; // save BEFORE deleting -- current is about to become invalid
        delete current;
        current = next;
    }
}
```

`push_back`'s empty-list special case exists because an empty list has `head == nullptr` — there's no "last node" to walk to and attach onto, so the new node must become `head` directly instead. The destructor's `Node<T>* next = current->next;` line, saved *before* `delete current;`, is critical: once `delete current;` runs, reading `current->next` afterward would be reading a field of memory that's just been freed — undefined behavior, and a real, common bug in hand-written destructors. Saving the next pointer first, then deleting, then advancing using the saved value, is the only safe order.

### SAVE AND TRY

```cpp
MyLinkedList<int> list;
list.push_front(1);
list.push_back(2);
list.push_back(3);
list.print(); // [1] -> [2] -> [3] -> nullptr
// list goes out of scope here -- destructor runs, freeing 3 nodes
```

Add a temporary `std::cout << "freeing node with value " << current->value << "\n";` line inside the destructor's loop, rebuild, and run this — confirm you see exactly 3 "freeing" messages, one per node, in the order `1`, `2`, `3` — direct, visible proof the destructor correctly walks and frees every node, not just the head.

## 🎯 Challenge

Add a `bool remove(T value)` method: find the first node whose `value` matches, unlink it from the chain (relinking the previous node's `next` to skip over it), free it, decrement `size`, and return `true` — or return `false` if no matching node was found. Handle the special case of removing `head` itself.

<details>
<summary>Solution</summary>

```cpp
template<typename T>
bool MyLinkedList<T>::remove(T value) {
    if (head == nullptr) return false;

    if (head->value == value) { // special case: removing the head itself
        Node<T>* toDelete = head;
        head = head->next;
        delete toDelete;
        size--;
        return true;
    }

    Node<T>* current = head;
    while (current->next != nullptr) {
        if (current->next->value == value) {
            Node<T>* toDelete = current->next;
            current->next = toDelete->next; // skip over the node being removed
            delete toDelete;
            size--;
            return true;
        }
        current = current->next;
    }
    return false; // walked the whole list, never found it
}
```

The head-removal special case exists for the same reason `push_back`'s empty-list case did: removing `head` means there's no "previous node" whose `next` needs updating — `head` itself is what needs to change. For every other node, `current->next = toDelete->next;` is the actual unlinking step — it makes the previous node point directly at whatever came *after* the removed node, skipping it entirely, before that node is freed.

</details>

## Mental Model

| Concept | `MyVector` (LAB-06) | `MyLinkedList` (this lab) |
|---|---|---|
| Memory layout | One contiguous block | Scattered nodes, connected by pointers |
| Indexed access (`[5]`) | O(1) — direct offset | O(n) — walk from head, one hop at a time |
| Insert at front | O(n) — shift everything right | O(1) — three pointer operations |
| Cleanup | One `delete[]` frees everything | Must walk the whole chain, freeing node by node |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why must `newNode->next = head;` happen before `head = newNode;` in `push_front`? | |
| 2 | Why does the destructor save `current->next` into a separate variable before calling `delete current;`? | |
| 3 | Why is `push_back` O(n) for a singly linked list, when `push_front` is O(1)? | |

## Quick Check Answers

1. Each element lives in its own individually heap-allocated `Node`, at whatever address the allocator happens to give it — completely unrelated to where any other node in the list lives; only the `next` pointers, not physical memory adjacency, define which node comes after which.
2. Inserting at the front of a linked list only requires updating a fixed, small number of pointers (the new node's `next`, and `head`) regardless of how many elements already exist; inserting at the front of an array-backed structure requires physically shifting every existing element one position over to make room, which takes time proportional to how many elements are already there.
3. It reads a field (`->next` or `->value`) through a pointer that points at nothing valid — this is undefined behavior, and on essentially every real system, it crashes the program immediately with a segmentation fault, since `nullptr` doesn't point at any memory your process is allowed to access.

*Next: [LAB-08 — Doubly Linked Lists](CPP-S02-LAB-08-DOUBLY-LINKED-LIST.md)*
