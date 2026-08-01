# CPP DSA — LAB-08 — Doubly Linked Lists

**Prerequisites:** LAB-07 (Singly Linked Lists)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What extra field does a doubly linked list's node have that a singly linked list's node doesn't?
2. Why is removing the *last* node of a singly linked list O(n), even though `push_back` can keep a `tail` pointer for O(1) insertion?
3. What breaks if you update a node's `next` pointer during removal but forget to update the neighboring node's `prev` pointer to match?

## What You Will Build

`MyDoublyLinkedList<T>` — extending LAB-07's node with a `prev` pointer and a tracked `tail`, enabling O(1) removal from *either* end, with a visualization showing both `next` and `prev` chains simultaneously.

```
$ ./dlist_demo
push_back(1): [1] <-> nullptr           (head=1, tail=1)
push_back(2): [1] <-> [2] <-> nullptr    (head=1, tail=2)
push_back(3): [1] <-> [2] <-> [3] <-> nullptr  (head=1, tail=3)
pop_back(): removed 3 -> [1] <-> [2] <-> nullptr  (head=1, tail=2)
pop_front(): removed 1 -> [2] <-> nullptr  (head=2, tail=2)
```

## Concept: Bidirectional Links — Trading Memory for Speed in Both Directions

**What it is:** A doubly linked list's node holds two pointers instead of one: `next` (as in LAB-07) *and* `prev`, pointing back at the previous node. The list itself tracks both `head` and `tail`. This symmetry means the list can be walked forward or backward, and — critically — a node can be removed in O(1) once you have a pointer to it, without needing to walk from `head` to find its predecessor first.

**The problem before:** LAB-07's singly linked list can only walk forward — `next`, never backward. This means `push_back` needs a full O(n) walk to find the last node (unless a separate `tail` pointer is maintained, which LAB-07 didn't do), and *removing* the last node is worse: even with a `tail` pointer telling you *where* the last node is, you still can't fix up the *new* last node's `next` to `nullptr` without first finding the second-to-last node — which requires walking from `head` all the way to it, because a singly linked list gives you no way to go backward from `tail`.

**The solution:** Add `prev` to every node. Now `tail->prev` gives instant access to the second-to-last node — no walk required. Removing from either end becomes O(1): update the neighboring node's pointer (`next` if removing from the front, `prev` if removing from the back) directly, no traversal needed. The cost: every node now carries one extra pointer's worth of memory, and every insertion/removal must correctly maintain *two* pointers instead of one, doubling the places a linking bug can hide.

**Canonical example:**

```cpp
template<typename T>
struct DNode {
    T value;
    DNode* next;
    DNode* prev;
    DNode(T v) : value(v), next(nullptr), prev(nullptr) {}
};
```

**Project Application:** LAB-09's linked-list-backed stack and LAB-10's linked-list-backed queue both work perfectly well with LAB-07's *singly* linked list (they only ever need one end) — this lab's bidirectional version is what a real double-ended queue (a "deque," needing O(1) operations at *both* ends) would build on, and it's the direct conceptual ancestor of `std::list`, which you'll be shown after building this by hand.

**Watch for:** Updating one direction's pointer during a removal and forgetting the other. If `current->next`'s `prev` isn't updated to skip the removed node, walking backward from that point produces a corrupted, inconsistent chain — one direction (`next`) shows the removal happened, the other direction (`prev`) still shows the old, now-invalid link. Every removal in this lab touches up to four pointers; missing even one leaves the list in a broken, half-updated state.

## Step 1: `DNode` — adding `prev`

```cpp
// MyDoublyLinkedList.h
#ifndef MY_DOUBLY_LINKED_LIST_H
#define MY_DOUBLY_LINKED_LIST_H

template<typename T>
struct DNode {
    T value;
    DNode* next;
    DNode* prev;
    DNode(T v) : value(v), next(nullptr), prev(nullptr) {}
};
```

Both `next` and `prev` initialize to `nullptr` in the constructor — a freshly created node starts connected to nothing in either direction, exactly LAB-07's discipline, just doubled. The naming (`DNode` instead of reusing `Node`) is deliberate: keeping this lab's node type distinct from LAB-07's avoids any ambiguity about which list a given node type belongs to if both headers ever end up included in the same file.

### SAVE AND TRY

```cpp
DNode<int>* single = new DNode<int>(42);
std::cout << "next: " << single->next << ", prev: " << single->prev << "\n";
// both print as null addresses
delete single;
```

## Step 2: The class, `head`/`tail`, and `push_back`

```cpp
template<typename T>
class MyDoublyLinkedList {
private:
    DNode<T>* head;
    DNode<T>* tail;
    int size;

public:
    MyDoublyLinkedList() : head(nullptr), tail(nullptr), size(0) {}
    ~MyDoublyLinkedList();

    void push_back(T value);
    void push_front(T value);
    bool pop_back();
    bool pop_front();
    int getSize() const { return size; }
    void print() const;
};

template<typename T>
void MyDoublyLinkedList<T>::push_back(T value) {
    DNode<T>* newNode = new DNode<T>(value);
    if (tail == nullptr) { // empty list: new node becomes both head AND tail
        head = tail = newNode;
    } else {
        newNode->prev = tail;   // new node looks BACKWARD at the current tail
        tail->next = newNode;   // current tail looks FORWARD at the new node
        tail = newNode;          // tail now points at the new last node
    }
    size++;
}
```

`push_back` here is O(1) — no walking at all — specifically *because* `tail` is tracked directly, unlike LAB-07's version, which had to walk the entire chain from `head` to find the last node every single time. Three pointer updates handle linking a new tail: the new node's `prev` looks back at the old tail, the old tail's `next` looks forward at the new node, and then `tail` itself is reassigned — the exact bidirectional symmetry the concept section described.

### SAVE AND TRY

```cpp
MyDoublyLinkedList<int> list;
list.push_back(1);
list.push_back(2);
list.push_back(3);
list.print(); // [1] <-> [2] <-> [3] <-> nullptr
```

(Assume `print()` is written analogously to LAB-07's, walking `next` from `head` — build it yourself before continuing, using LAB-07's version as a template.)

## Step 3: `pop_back` — O(1) removal from the tail, no traversal

```cpp
template<typename T>
bool MyDoublyLinkedList<T>::pop_back() {
    if (tail == nullptr) return false; // empty list

    DNode<T>* toDelete = tail;

    if (tail->prev == nullptr) { // only one node in the list
        head = tail = nullptr;
    } else {
        tail = tail->prev;   // step 1: move tail BACKWARD to the second-to-last node
        tail->next = nullptr; // step 2: the new tail now correctly points at nothing
    }

    delete toDelete;
    size--;
    return true;
}
```

`tail->prev` is what makes this O(1): finding "the node before the tail" is a single pointer dereference, not a walk from `head`. This is the exact capability LAB-07's singly linked list lacked entirely — a singly linked list's `pop_back` (if you tried to write one) would be forced into an O(n) walk from `head` to find the second-to-last node, because `next`-only pointers give no way to step backward from `tail`.

### SAVE AND TRY

```cpp
MyDoublyLinkedList<int> list;
list.push_back(1);
list.push_back(2);
list.push_back(3);
list.pop_back();
list.print(); // [1] <-> [2] <-> nullptr
```

Confirm `3` is gone and the new tail (`2`) correctly has `next == nullptr` — you can verify this by temporarily adding a debug print of `tail->next` right after `pop_back()` returns.

## Step 4: `pop_front` — the symmetric case, and the destructor

```cpp
template<typename T>
bool MyDoublyLinkedList<T>::pop_front() {
    if (head == nullptr) return false;

    DNode<T>* toDelete = head;

    if (head->next == nullptr) { // only one node
        head = tail = nullptr;
    } else {
        head = head->next;
        head->prev = nullptr; // the new head has nothing before it
    }

    delete toDelete;
    size--;
    return true;
}

template<typename T>
MyDoublyLinkedList<T>::~MyDoublyLinkedList() {
    DNode<T>* current = head;
    while (current != nullptr) {
        DNode<T>* next = current->next; // save before delete -- LAB-07's exact discipline
        delete current;
        current = next;
    }
}
```

`pop_front` mirrors `pop_back` exactly, with `head`/`next` swapped for `tail`/`prev` — worth noticing that symmetry directly, since it's evidence the bidirectional design genuinely treats both ends equally, rather than favoring one. The destructor is identical in structure to LAB-07's — walking forward via `next` and freeing each node still works perfectly fine even though nodes also have `prev`; the destructor simply never needs to look at `prev` at all, since a single forward pass visits every node exactly once regardless.

### SAVE AND TRY

Run the full sequence from "What You Will Build": three `push_back`s, then `pop_back()`, then `pop_front()`, printing after each operation. Confirm your output matches exactly, including the empty-list edge cases if you push further pops than there are elements (`pop_front()`/`pop_back()` on an empty list should return `false`, not crash).

## 🎯 Challenge

Add a `print_reverse()` method that walks the list backward starting from `tail`, using only `prev` pointers — proving the bidirectional structure genuinely supports traversal in both directions, something LAB-07's singly linked list structurally cannot do at all (there'd be no way to even start such a method, since nothing points backward).

<details>
<summary>Solution</summary>

```cpp
template<typename T>
void MyDoublyLinkedList<T>::print_reverse() const {
    DNode<T>* current = tail;
    std::cout << "[";
    bool first = true;
    while (current != nullptr) {
        if (!first) std::cout << "] <- [";
        std::cout << current->value;
        first = false;
        current = current->prev; // walking BACKWARD -- impossible in LAB-07's structure
    }
    std::cout << "] <- nullptr\n";
}
```

```cpp
list.print();          // [1] <-> [2] <-> [3] <-> nullptr
list.print_reverse();  // [3] <- [2] <- [1] <- nullptr
```

This method's entire existence depends on `prev` — remove that one field from `DNode` and this method becomes literally impossible to write, not just harder, since there'd be no path back from `tail` toward `head` at all. That's the clearest, most concrete way to see exactly what the extra memory cost of `prev` buys: an entire class of operation (backward traversal, O(1) removal from the tail) that a singly linked list cannot support no matter how cleverly you write around it.

</details>

## Mental Model

| Concept | `MyLinkedList` (LAB-07) | `MyDoublyLinkedList` (this lab) |
|---|---|---|
| Node fields | `value`, `next` | `value`, `next`, `prev` |
| Remove from tail | O(n) — must walk from head to find the predecessor | O(1) — `tail->prev` gives it directly |
| Backward traversal | Impossible — no path back from any node | Possible — walk `prev` from any node |
| Memory cost per node | One pointer | Two pointers |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why is `pop_back()` O(n) for a singly linked list but O(1) here? | |
| 2 | Why does `pop_front()` need to set `head->prev = nullptr` after advancing `head`? | |
| 3 | Why doesn't the destructor need to look at `prev` pointers at all? | |

## Quick Check Answers

1. A doubly linked list node adds a `prev` pointer, pointing back at the previous node — a singly linked list's node only ever has `next`, pointing forward.
2. Because a singly linked list's node can only find whatever comes *after* it (`next`) — there's no way, from `tail`, to reach the node before it without walking the entire chain from `head` all the way to the second-to-last node; a doubly linked list's `tail->prev` reaches that same node in one step.
3. Without updating `prev`, the "new" chain (as seen by walking forward via `next`) would correctly skip the removed node, but the same nodes' `prev` pointers would still reflect the old, pre-removal links — walking backward from anywhere past the removal point would land back on a node that `next`-based traversal says isn't there anymore, an inconsistent, corrupted structure.

*Next: [LAB-09 — Stacks](CPP-S02-LAB-09-STACKS.md)*
