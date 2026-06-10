# C++ Masterclass — S-02 — LAB 02 — The Doubly Linked List: O(1) at Both Ends

**Prerequisites:** S-02 LAB 01. You built a singly linked list with O(1) prepend
and O(n) tail removal.

**What this lab adds:**
- The remaining O(n) problem: why `removeTail` still traverses the whole list
- Adding a `tail` pointer to eliminate that traversal
- The doubly linked list — adding a `prev` pointer so every node knows its predecessor
- O(1) removal from the tail using `prev`
- The `SnakeList` struct — wrapping head, tail, and length into one managed type
- Complete O(1) snake movement — prepend new head, pop old tail, zero copying

**Time:** ~70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB 01, `removeTail` traversed from the head to find the second-to-last
>    node — O(n) work. What single piece of information, if stored, would make
>    this traversal unnecessary?
> 2. A doubly linked list node has both a `next` and a `prev` pointer. When you
>    remove the tail node, which pointers must be updated and in what order?
> 3. Predict: After `prepend` and `removeTail` are both O(1), what is the Big-O
>    cost of moving a snake of length 1000 one step?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `SnakeList` struct — a complete doubly linked list that wraps head, tail, and length.
Snake movement in the game loop becomes exactly two function calls, no loop:

```
Before move:   head→[12,4]→[11,4]→[10,4]←→ ... ←→[3,4]←tail
After move right:
  prepend(13, 4):   head→[13,4]→[12,4]→...→[3,4]←tail
  popTail():        head→[13,4]→[12,4]→...→[4,4]←tail
  Total operations: O(1) — exactly 6 pointer writes regardless of list length
```

---

## Part 1 — The Remaining O(n) Problem

### Concept: The Tail Pointer — Eliminating the Traversal

**The problem from LAB 01:**
`removeTail` needed to find the second-to-last node to:
1. Free the tail node
2. Set the new tail's `next` to `nullptr`

Finding the second-to-last required traversing from the head — O(n).

**The solution — store a `tail` pointer:**
If the list also tracks a pointer to the last node, the tail is reachable in O(1).
But there is still a problem: after deleting the tail node, we need to access the node
*before* the old tail to set its `next` to `nullptr`. With a singly linked list, that
node's address is not stored anywhere — we still need traversal.

**The complete solution — doubly linked list:**
Add a `prev` pointer to every node. The tail node's `prev` points to the
second-to-last node. Deleting the tail becomes:

```
1. Node* oldTail = tail               (one read — O(1))
2. tail = oldTail->prev               (one pointer — O(1))
3. tail->next = nullptr               (one write — O(1))
4. delete oldTail                     (one deallocation — O(1))
Total: 4 operations, always — O(1)
```

---

### Concept: Doubly Linked List — Bidirectional Navigation

**What it is:** A linked list where every node has two pointers:
- `next` — points to the node ahead (toward the tail)
- `prev` — points to the node behind (toward the head)

```
nullptr ←prev [head:12,4] next→←prev [11,4] next→←prev [10,4:tail] next→ nullptr
```

**What it enables:**
- Traverse in either direction — forward from head, backward from tail
- O(1) removal of any node whose address you have (you have both neighbors)
- O(1) insertion before or after any node you already point to

**What it costs:**
- Each node needs one extra pointer (8 bytes on 64-bit) — more memory
- Every insert and delete must update both `next` and `prev` — more careful pointer management

**The trade-off:** Doubly linked lists use more memory and require more careful pointer
updates than singly linked lists. They are worth this cost when you need O(1) removal
from the tail (or middle). For Snake, the choice is clear: the game loop runs 10 times
per second at 60+ FPS. O(n) tail removal would dominate CPU time at long snake lengths.

**Watch for:** When updating a doubly linked list, order of pointer updates matters.
If you free a node before recording its `prev` address, that address is lost. Always
save needed pointers before `delete`.

---

## Step 1 — The Doubly-Linked Node

Start a new `main.cpp` (or continue in the S-02 folder):

```cpp
#include <iostream>    // std::cout, std::endl

// ── DNode — one node in a doubly linked list ──────────────────────────────────
struct DNode {
    int    row  = 0;
    int    col  = 0;
    DNode* next = nullptr;   // toward the tail
    DNode* prev = nullptr;   // toward the head
};
```

**Why rename from `Node` to `DNode`?** To visually distinguish the two types while
you study them side by side. In practice, you would just call it `Node` once you
commit to the doubly linked version.

---

### Concept: `SnakeList` — Encapsulating the List

**What it is:** Rather than passing `head`, `tail`, and `length` as three separate
parameters to every function, we group them into a struct. This is the same reasoning
as grouping `hp`, `maxHp`, and `name` into a `Player` struct in S-01 LAB 10 —
data that belongs together should travel together.

```cpp
struct SnakeList {
    DNode* head   = nullptr;   // first segment (the snake's head)
    DNode* tail   = nullptr;   // last segment (the snake's tail)
    int    length = 0;         // total number of segments
};
```

**The protected invariant:**
- If `length == 0`, both `head` and `tail` are `nullptr`
- If `length == 1`, `head == tail` (same node)
- If `length > 1`, `head->prev == nullptr` and `tail->next == nullptr`
- Every node's `prev->next == node` and `next->prev == node`

These invariants must hold after every operation. Violating them corrupts the list.

---

## Step 2 — Prepend with Doubly Linked Pointers

Add after the struct definitions:

```cpp
// ── prepend — add a new head node to the list ────────────────────────────────
// Adds a new node at the front. Updates both head and the old head's prev.
void prepend(SnakeList& list, int newRow, int newCol) {
    DNode* newNode = new DNode();
    newNode->row  = newRow;
    newNode->col  = newCol;
    newNode->next = list.head;    // new node points forward to old head
    newNode->prev = nullptr;      // new node is the new head — nothing behind it

    if (list.head != nullptr) {
        list.head->prev = newNode;  // old head's prev now points back to new node
    }
    list.head = newNode;            // advance the head pointer

    if (list.length == 0) {
        list.tail = newNode;        // first node is both head and tail
    }

    ++list.length;
}

// ── popTail — remove the last node from the list ─────────────────────────────
// Removes the tail node. Updates both tail and the new tail's next. O(1).
void popTail(SnakeList& list) {
    if (list.tail == nullptr) return;   // empty list — nothing to pop

    DNode* oldTail = list.tail;         // save pointer before deleting

    list.tail = oldTail->prev;          // move tail back one node — O(1) via prev pointer

    if (list.tail != nullptr) {
        list.tail->next = nullptr;      // new tail has no next
    } else {
        list.head = nullptr;            // list is now empty — head must also be null
    }

    delete oldTail;   // free the old tail's memory
    --list.length;
}
```

**`SnakeList& list`:** The list is passed by reference. `prepend` and `popTail`
modify `head`, `tail`, and `length` — these changes must affect the original struct
in the caller. Without `&`, modifications would apply to a copy and be lost.

---

## Step 3 — Print the List (Both Directions to Verify)

```cpp
// ── printForward — head to tail ───────────────────────────────────────────────
void printForward(const SnakeList& list) {
    std::cout << "  Forward: ";
    const DNode* current = list.head;
    while (current != nullptr) {
        std::cout << "(" << current->row << "," << current->col << ")";
        if (current->next != nullptr) std::cout << " → ";
        current = current->next;
    }
    std::cout << " → nullptr" << std::endl;
}

// ── printBackward — tail to head (verifies prev pointers are correct) ─────────
void printBackward(const SnakeList& list) {
    std::cout << "  Backward: ";
    const DNode* current = list.tail;
    while (current != nullptr) {
        std::cout << "(" << current->row << "," << current->col << ")";
        if (current->prev != nullptr) std::cout << " ← ";
        current = current->prev;
    }
    std::cout << " ← nullptr" << std::endl;
}
```

**Why print backward?** If the `prev` pointers are wrong, the backward traversal
produces garbage. Printing both directions is a quick sanity check that all four
pointer updates in each operation were correct.

---

## Step 4 — Movement Demo

```cpp
int main() {
    std::cout << "=== Doubly Linked Snake — O(1) Movement ===" << std::endl;
    std::cout << std::endl;

    SnakeList snake;

    // Build initial snake: 3 segments along row 4 going right
    // Prepend right-to-left so head ends up at the highest column
    prepend(snake, 4, 8);    // tail (added first)
    prepend(snake, 4, 9);
    prepend(snake, 4, 10);   // head (added last — becomes list.head)

    std::cout << "Initial snake (length " << snake.length << "):" << std::endl;
    printForward(snake);
    printBackward(snake);
    std::cout << std::endl;

    // Simulate 4 frames of rightward movement — O(1) per frame
    for (int frame = 1; frame <= 4; ++frame) {
        int newCol = snake.head->col + 1;   // move right — same row
        prepend(snake, snake.head->row, newCol);   // O(1): new head
        popTail(snake);                            // O(1): remove old tail

        std::cout << "Frame " << frame << ":" << std::endl;
        printForward(snake);
        printBackward(snake);
        std::cout << std::endl;
    }

    // Growth: eat food — prepend without popping tail
    std::cout << "=== Snake eats food (grows to length 4) ===" << std::endl;
    prepend(snake, snake.head->row, snake.head->col + 1);   // prepend new head
    // No popTail — the snake grows
    std::cout << "After eating (length " << snake.length << "):" << std::endl;
    printForward(snake);
    printBackward(snake);
    std::cout << std::endl;

    // Clean up — traverse and delete all nodes
    DNode* current = snake.head;
    while (current != nullptr) {
        DNode* next = current->next;
        delete current;
        current = next;
    }

    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Forward and backward traversals match on every frame.
The head column increases by 1 each frame; the tail column follows by 1.
After food: length 4, the tail does NOT advance (snake grew).

**Verify O(1) cost:** The movement loop has no inner loop. `prepend` and `popTail`
each do a fixed number of pointer operations. The snake could be length 1000 and
each frame would still do exactly the same 8-12 pointer writes.

---

## 🎯 Challenge: `insertAfter`

**You know:** Doubly linked list pointer manipulation.

**Task:** Write `void insertAfter(SnakeList& list, DNode* target, int row, int col)`
that inserts a new node immediately after `target`. Update `length`. Handle the edge
case where `target` is the current tail.

This operation simulates "healing mid-body" — a power-up that adds a segment in
the middle of the snake.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void insertAfter(SnakeList& list, DNode* target, int row, int col) {
    if (target == nullptr) return;

    DNode* newNode   = new DNode();
    newNode->row     = row;
    newNode->col     = col;
    newNode->prev    = target;          // new node's prev = target
    newNode->next    = target->next;    // new node's next = target's old next

    if (target->next != nullptr) {
        target->next->prev = newNode;   // target's old next points back to new node
    } else {
        list.tail = newNode;            // new node is the new tail
    }

    target->next = newNode;             // target's next = new node
    ++list.length;
}
```

**Key insight:** Four pointer writes in a fixed order — always O(1) regardless of
where in the list the insertion occurs. This is the power of doubly linked lists:
if you have a pointer to a node, you can insert or delete adjacent to it in O(1)
without touching any other node. Arrays cannot do this without O(n) shifting.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `prepend` updates `prev` | Backward traversal matches forward traversal in reverse |
| `popTail` is O(1) | No loop inside `popTail` — uses `tail->prev` directly |
| Length tracking | `snake.length` equals number of nodes printed |
| Movement frames | Head col+1 each frame; tail follows; content stays 3 nodes |
| Growth demo | After eat, `snake.length` is 4; tail has not moved |
| Edge case: length 1 | `head == tail`; after `popTail`, both are `nullptr`, length is 0 |
| No memory leak | ASan shows no leaks; final cleanup loop deletes all nodes |

---

## Quick Check Answers

**1. What single piece of information eliminates the traversal in `removeTail`?**
A `prev` pointer on the tail node — pointing to the second-to-last node. With `tail->prev`,
the second-to-last node is reachable in O(1) without any traversal. This is the defining
feature of the doubly linked list: each node knows its neighbor in both directions.

**2. Which pointers must be updated when removing the tail?**
In order: (1) Save `oldTail = list.tail`. (2) Update `list.tail = oldTail->prev`.
(3) Set `list.tail->next = nullptr` (the new tail has no forward node). (4) `delete oldTail`.
The order matters: after `delete oldTail`, the memory at that address is invalid —
any read of `oldTail->prev` after deletion would access freed memory (undefined behavior).
Always save any needed values before `delete`.

**3. Big-O cost of moving a length-1000 snake one step?**
O(1) — constant time. `prepend` does a fixed number of pointer writes. `popTail` does
a fixed number of pointer writes (using `tail->prev`). Neither function contains a
loop. The snake's length does not appear in any pointer operation count. Moving a
length-1000 snake costs the same as moving a length-3 snake: approximately 8–12
pointer assignments total.
