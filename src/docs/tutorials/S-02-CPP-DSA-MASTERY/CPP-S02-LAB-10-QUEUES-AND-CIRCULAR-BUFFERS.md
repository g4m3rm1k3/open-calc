# CPP DSA — LAB-10 — Queues and Circular Buffers

**Prerequisites:** LAB-09 (Stacks)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What does FIFO stand for, and how is it the opposite of LAB-09's LIFO?
2. If you implement a queue by removing from index 0 of a `MyVector` every time, why is that O(n) per removal — what has to happen to every remaining element?
3. What does "wraparound" mean for a circular buffer, and what C++ operator makes it work?

## What You Will Build

`MyQueue<T>` backed by `MyLinkedList<T>` (correctly, at O(1) on both ends — Step 1 explains why the *naive* array approach is a trap), then a fixed-size `CircularBuffer<T>` that reuses a single pre-allocated array forever, wrapping indices around with the modulo operator instead of ever shifting elements.

```
$ ./queue_demo
enqueue(1), enqueue(2), enqueue(3): front=1
dequeue(): removed 1, front=2
dequeue(): removed 2, front=3

Circular buffer (capacity 4):
write(10): [10, _, _, _]  head=0 tail=1
write(20): [10, 20, _, _]  head=0 tail=2
write(30): [10, 20, 30, _]  head=0 tail=3
write(40): [10, 20, 30, 40]  head=0 tail=0 (wrapped!)
read(): got 10, buffer now: [_, 20, 30, 40]  head=1 tail=0
write(50): [50, 20, 30, 40]  head=1 tail=1 (wrote into the freed slot, wrapped!)
```

## Concept: FIFO — First In, First Out, and the Trap of Naive Array Removal

**What it is:** A queue is LAB-09's stack turned inside-out: `enqueue` adds to the *back*, `dequeue` removes from the *front* — the *first* thing added is the *first* thing removed, like a line of people waiting: whoever got in line first gets served first. A **circular buffer** is a fixed-capacity queue variant backed by a single array that never resizes or shifts — instead, it tracks `head`/`tail` indices that wrap back around to `0` using the modulo (`%`) operator once they'd otherwise run off the end of the array.

**The problem before:** A queue needs O(1) removal from the *front* — but `MyVector` (LAB-06) has no such operation; removing its first element (`data[0]`) naively means shifting *every remaining element* one slot to the left to close the gap, an O(n) operation on every single `dequeue`. This is a real, common beginner mistake: reaching for an array and removing from index 0 in a loop, not realizing each removal is silently O(n), turning what looks like an O(n) algorithm into an accidental O(n²) one.

**The solution:** For a general-purpose queue, use `MyLinkedList` (LAB-07) — `push_back` (O(1), enqueue at the tail) and `pop_front` (O(1), dequeue at the head) are both already fast, with no shifting required, because removing the front of a linked list just means moving `head` to point at the second node, discarding the first — no other node needs to move at all. For a *fixed-capacity* queue where you know the maximum size in advance and want to avoid the memory overhead of individually-allocated nodes, a circular buffer reuses one single array forever: instead of shifting elements when the front is removed, it just moves a `head` index forward, and when `head` or `tail` would run past the end of the array, `% capacity` wraps it back to `0` — turning the array into a logical ring.

**Canonical example:**

```cpp
template<typename T>
class CircularBuffer {
private:
    T* data;
    int capacity, head, tail, count;
public:
    void write(T value) {
        data[tail] = value;
        tail = (tail + 1) % capacity; // wraps back to 0 once it reaches capacity
        count++;
    }
};
```

**Project Application:** LAB-17's BFS graph traversal needs exactly a FIFO queue (this lab's `MyQueue`) to visit nodes in the correct breadth-first order — the opposite of LAB-09's stack-based DFS. Circular buffers are the real structure behind bounded producer/consumer buffers, audio/network packet buffers, and — directly relevant to this series — the kind of fixed-size sliding window a file-reading tool (LAB-18/19) might use to buffer recently-read records.

**Watch for:** Confusing `count` (how many elements are currently stored) with `capacity` (the fixed array size) in a circular buffer. Because `head` and `tail` both wrap around and can end up pointing at the *same* index whether the buffer is completely empty or completely full, `head == tail` alone can't tell you which — you need the separate `count` field to disambiguate, exactly the way `MyVector` needed both `size` and `capacity` as two separate numbers in LAB-06.

## Step 1: The naive, O(n)-per-dequeue array approach (reproduced on purpose)

```cpp
template<typename T>
class NaiveArrayQueue {
private:
    MyVector<T> data;
public:
    void enqueue(T value) { data.push_back(value); } // O(1) -- fine

    T dequeue() {
        T front = data[0];
        // Shifting every remaining element left by one, to fill the gap at index 0:
        for (int i = 0; i < data.getSize() - 1; i++) {
            data[i] = data[i + 1];
        }
        data.pop_back(); // remove the now-duplicated last element
        return front;
    }
};
```

`enqueue` is fine (O(1), same as `MyStack`'s `push`) — the problem is entirely in `dequeue`'s shifting loop, which touches every single remaining element, every single time, purely to close the gap left at index 0. For `n` sequential `dequeue` calls, this is the exact same O(n²) trap LAB-06's concept section warned about for naive array growth — a different operation, the identical underlying mistake.

### SAVE AND TRY

Enqueue 5 elements, then call `dequeue()` and print `data`'s contents after each call — watch every remaining element visibly shift left by one position, every single time, confirming the O(n) shift is really happening, not just a theoretical concern.

## Step 2: `MyQueue<T>` — correctly, backed by `MyLinkedList`

```cpp
// MyQueue.h
#ifndef MY_QUEUE_H
#define MY_QUEUE_H

#include "MyLinkedList.h" // LAB-07, needs push_back, and a pop_front + front() pair added
#include <stdexcept>

template<typename T>
class MyQueue {
private:
    MyLinkedList<T> data;

public:
    void enqueue(T value) {
        data.push_back(value); // O(1) with a tracked... wait -- LAB-07's push_back was O(n)!
    }
    // see the note below before continuing
};

#endif
```

Hold on — LAB-07's `push_back` walked the *whole list* to find the last node, making it O(n), not O(1). For a queue backed by a singly linked list to actually be efficient, it needs its own tracked `tail` pointer (exactly LAB-08's doubly linked list already has) — reuse `MyDoublyLinkedList` instead, whose `push_back` (LAB-08 Step 2) and `pop_front` (LAB-08 Step 4) are both genuinely O(1):

```cpp
#include "MyDoublyLinkedList.h" // LAB-08

template<typename T>
class MyQueue {
private:
    MyDoublyLinkedList<T> data;

public:
    void enqueue(T value) {
        data.push_back(value); // O(1) -- LAB-08's tracked tail
    }

    T dequeue() {
        if (data.getSize() == 0) {
            throw std::out_of_range("dequeue() called on empty queue");
        }
        T value = data.front(); // requires adding a front() accessor to MyDoublyLinkedList
        data.pop_front();        // O(1) -- LAB-08's tracked head
        return value;
    }

    bool isEmpty() const { return data.getSize() == 0; }
};
```

This is a direct, concrete payoff of building LAB-08's bidirectional list instead of stopping at LAB-07's singly-linked one: a correct, genuinely O(1)-on-both-ends queue falls out almost for free, because the hard work (tracked `head` *and* `tail`, O(1) operations at both) was already done.

### SAVE AND TRY

Add a `front()` accessor to `MyDoublyLinkedList` (return `head->value`, mirroring how `top()` worked in LAB-09's stack), finish this class, and run: `enqueue(1)`, `enqueue(2)`, `enqueue(3)`, then three `dequeue()` calls, printing each removed value. Confirm they come out in the order `1, 2, 3` — the FIFO order, the opposite of LAB-09's stack, which would have produced `3, 2, 1` for the identical push sequence.

## Step 3: `CircularBuffer<T>` — fixed capacity, no shifting, ever

```cpp
// CircularBuffer.h
#ifndef CIRCULAR_BUFFER_H
#define CIRCULAR_BUFFER_H

#include <stdexcept>

template<typename T>
class CircularBuffer {
private:
    T* data;
    int capacity;
    int head; // index of the oldest element (next to be read)
    int tail; // index where the NEXT written element will go
    int count; // how many elements are currently stored -- disambiguates full vs. empty

public:
    CircularBuffer(int cap) : capacity(cap), data(new T[cap]), head(0), tail(0), count(0) {}
    ~CircularBuffer() { delete[] data; }

    void write(T value) {
        if (count == capacity) {
            throw std::out_of_range("CircularBuffer is full");
        }
        data[tail] = value;
        tail = (tail + 1) % capacity; // THE wraparound
        count++;
    }

    T read() {
        if (count == 0) {
            throw std::out_of_range("CircularBuffer is empty");
        }
        T value = data[head];
        head = (head + 1) % capacity; // wraps here too
        count--;
        return value;
    }
};

#endif
```

`(tail + 1) % capacity` is the entire trick: for `capacity == 4`, `tail` cycles `0, 1, 2, 3, 0, 1, 2, 3, ...` forever — `%` (modulo, remainder-after-division) is exactly what makes an index wrap back to the start instead of running off the end of the array. Notice `data` is allocated *once*, in the constructor, at a fixed `capacity`, and never resized, reallocated, or shifted for the entire lifetime of the buffer — every `write`/`read` touches at most one array slot, genuinely O(1), no exceptions, unlike `MyVector`'s occasional O(n) resize.

### SAVE AND TRY

```cpp
CircularBuffer<int> buf(4);
buf.write(10); buf.write(20); buf.write(30); buf.write(40);
std::cout << "read: " << buf.read() << "\n"; // 10
buf.write(50); // writes into the slot freed by the read -- WRAPS around to index 0
std::cout << "read: " << buf.read() << "\n"; // 20
std::cout << "read: " << buf.read() << "\n"; // 30
```

Add a temporary debug print of `head`, `tail`, and `count` after every `write`/`read` call — trace through and confirm `tail` actually wraps from `3` back to `0` on the `write(50)` call, matching "What You Will Build"'s trace at the top of this lab exactly.

## Step 4: `head == tail` is ambiguous — why `count` is required

```cpp
CircularBuffer<int> empty(3);
// head == 0, tail == 0 here -- looks "full" or "empty"? Can't tell from head/tail alone.

CircularBuffer<int> full(3);
full.write(1); full.write(2); full.write(3);
// head == 0, tail == 0 here too (tail wrapped after the 3rd write) -- IDENTICAL to the empty case above!
```

Both an entirely empty buffer and an entirely full buffer of capacity 3 end up with `head == 0 && tail == 0` — without a separate `count`, there would be no way to distinguish "nothing here" from "completely full" just by comparing the two indices, which is precisely why `count` exists as its own tracked field rather than being computed from `head`/`tail` alone. This is the same two-numbers-not-one lesson as LAB-06's `size`/`capacity` pair, showing up again in a new, easy-to-miss form.

### SAVE AND TRY

Construct both an `empty` and a `full` `CircularBuffer<int>(3)` as shown above, and print `head` and `tail` for each — confirm they really are identical despite representing opposite states, then print `count` for each and confirm *that's* the field that correctly tells them apart (`0` vs `3`).

## 🎯 Challenge

Add an `isFull()` and `isEmpty()` method to `CircularBuffer`, and use them to make `write`/`read` fail gracefully (return `bool` indicating success, instead of throwing) as an alternative API style — useful in real-time/embedded contexts (like actual audio buffers) where exceptions are often avoided entirely for performance and predictability reasons.

<details>
<summary>Solution</summary>

```cpp
bool isFull() const { return count == capacity; }
bool isEmpty() const { return count == 0; }

bool tryWrite(T value) {
    if (isFull()) return false;
    data[tail] = value;
    tail = (tail + 1) % capacity;
    count++;
    return true;
}

bool tryRead(T& outValue) {
    if (isEmpty()) return false;
    outValue = data[head];
    head = (head + 1) % capacity;
    count--;
    return true;
}
```

`tryRead` takes `T& outValue` — a reference parameter used as an **output parameter**: instead of returning the read value directly (which would leave no room in the return type for a separate success/failure signal), the function writes the result *into* the caller's variable via the reference, and uses its actual `return` value purely for success/failure. This is a common C++ pattern precisely when a function needs to communicate two independent things — "did it work" and "here's the data" — without bundling them into a single struct the way LAB-09's Challenge did.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Queue dequeue on `MyVector` | Just remove `data[0]`, should be fast | O(n) — every remaining element must shift left |
| Queue backing structure | Singly linked list is fine | Needs a tracked tail too — use the doubly linked list (LAB-08) |
| Circular buffer growth | Should resize like `MyVector` when full | Fixed capacity, by design — `write` on a full buffer fails/throws instead |
| `head == tail` in a circular buffer | Unambiguously means "empty" | Ambiguous — also true when completely full; `count` disambiguates |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `NaiveArrayQueue::dequeue()` need to shift every remaining element, while `MyQueue::dequeue()` (linked-list-backed) doesn't? | |
| 2 | Why does `CircularBuffer` need a separate `count` field instead of just comparing `head` and `tail`? | |
| 3 | What does `% capacity` accomplish in `tail = (tail + 1) % capacity;`? | |

## Quick Check Answers

1. FIFO ("First In, First Out") — the reverse of LAB-09's LIFO: the first element added is the first one removed, like a line of people waiting to be served in the order they arrived, rather than a stack of plates where only the most recent addition is reachable.
2. Removing index 0 from an array leaves a gap at the front — to keep the remaining elements contiguous starting at index 0 (which array-based indexing requires), every element after the gap has to move one position to the left, an operation touching all `n-1` remaining elements every single time.
3. It means the index has wrapped around from the end of the array back to the beginning — "wraparound" — implemented with the modulo (`%`) operator, which returns the remainder after division: once `tail + 1` reaches `capacity`, `(tail + 1) % capacity` evaluates to `0` instead of an out-of-bounds index.

*Next: [LAB-11 — Recursion and the Call Stack](CPP-S02-LAB-11-RECURSION-AND-CALL-STACK.md)*
