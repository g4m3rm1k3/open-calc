# Lesson 07: Queue

**What you will build**
You will write isolated console programs that store and retrieve data in a strict First-In-First-Out (FIFO) sequence. You will implement this behavior from scratch using both a circular array and a two-pointer linked structure, before relying on the C++ Standard Library. The transferable problem this solves is scheduling and ordering—ensuring tasks or data are processed exactly in the order they arrived, without skipping or reordering.

**What you need to know first**
Lesson 04 Singly Linked List, Lesson 03 Pointers, Lesson 11 Templates.

**Terms used in this lesson**
- **Queue** — A data structure that enforces First-In-First-Out (FIFO) access. *Why it exists:* To guarantee fairness and correct sequencing when processing streams of data or tasks, ensuring the oldest item is handled before any newer ones.
- **Enqueue** — The operation of adding an item to the back of a queue. *Why it exists:* To record a new arrival without disturbing the items already waiting in line.
- **Dequeue** — The operation of removing an item from the front of a queue. *Why it exists:* To consume the oldest item so the system can move on to the next one in line.
- **Circular buffer** — An array where the end wraps around to the beginning. *Why it exists:* To allow a queue to reuse array space continuously as items are enqueued and dequeued, preventing the items from walking off the end of fixed-size memory.
- **Two-pointer linked list** — A linked list that maintains explicit pointers to both the head and the tail nodes. *Why it exists:* To allow O(1) instantaneous insertion at the back (tail) and removal at the front (head), without traversing the list.

**Objects and methods used**
- **`std::queue<T>` / `push`**
  - *What it is:* A standard library container adapter that enforces FIFO rules on an underlying container.
  - *Implementation:* `void push(const T& value);`
  - *Its use:* Enqueues a new element at the back of the queue.
- **`std::queue<T>` / `pop`**
  - *What it is:* A standard library method for removal.
  - *Implementation:* `void pop();`
  - *Its use:* Removes the front element from the queue. It does not return the element.
- **`std::queue<T>` / `front`**
  - *What it is:* A standard library method for access.
  - *Implementation:* `T& front();`
  - *Its use:* Reads the value of the oldest element without removing it.

---

## Concept Unit: Queue via Circular Buffer

### The Problem
You need to enforce a strict order of operations: first to arrive, first to be processed. If you use a standard array and shift every element left when you remove the front item, you waste massive amounts of CPU time just moving data. If you don't shift them, your items gradually march toward the end of the array until you run out of space. You need a way to reuse the empty space at the front of the array continuously.

### The New Code
```cpp
#include <iostream>

class CircularQueue {
private:
    int* data;
    int capacity;
    int front;
    int rear;
    int count;

public:
    CircularQueue(int size) {
        capacity = size;
        data = new int[capacity];
        front = 0;
        rear = 0;
        count = 0;
    }

    ~CircularQueue() {
        delete[] data;
    }

    void enqueue(int val) {
        if (count == capacity) {
            std::cout << "Queue is full!\n";
            return;
        }
        data[rear] = val;
        rear = (rear + 1) % capacity;
        count++;
    }

    int dequeue() {
        if (count == 0) {
            std::cout << "Queue is empty!\n";
            return -1;
        }
        int val = data[front];
        front = (front + 1) % capacity;
        count--;
        return val;
    }
};

int main() {
    CircularQueue q(3);
    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);
    
    std::cout << "Dequeued: " << q.dequeue() << "\n";
    q.enqueue(40);
    std::cout << "Dequeued: " << q.dequeue() << "\n";
    
    return 0;
}
```

### The Updated Project
No reference counterpart — this is a from-scratch addition because we are proving the mechanics of a queue in isolation. The `CircularQueue` class manages its own memory and enforces FIFO semantics using array indices.

### Mechanical Walkthrough
- `int front;`: Tracks the index of the oldest item, which will be the next one removed.
- `int rear;`: Tracks the index where the newest item will be inserted.
- `int count;`: Tracks the current number of items to easily differentiate between a completely full and a completely empty queue.
- `data[rear] = val;`: Writes the new value into the array at the current `rear` index.
- `rear = (rear + 1) % capacity;`: Moves the `rear` index forward by one. The modulo operator `%` is the circular trick: if `capacity` is 3, and `rear` reaches 3, `3 % 3` evaluates to `0`. The index wraps around to the beginning.
- `int val = data[front];`: Reads the oldest value before moving the `front` pointer away from it.
- `front = (front + 1) % capacity;`: Moves the `front` index forward by one, wrapping around to the beginning exactly like `rear` does.
- `std::cout << "Dequeued: " << q.dequeue() << "\n";`: Calls `dequeue()`, executing the removal, and prints the returned value.

### CS Lens
This is a Circular Buffer implementation of a Queue. It achieves O(1) enqueue and dequeue operations without any memory reallocation or data shifting. Also recognized in: operating system keyboard buffers, audio playback streams, network packet buffers.

### SE Lens
The alternative not chosen is a dynamically resizing array (like `std::vector`) that deletes from the front. The tradeoff there is that erasing from the front of a contiguous block of memory requires shifting every remaining element one position to the left, turning an O(1) operation into an O(N) operation. The circular buffer trades away automatic growth (it is fixed-size) to gain instantaneous performance.

### Run It Yourself
1. Open a terminal and save the code in `circular_queue.cpp`.
2. Compile: `g++ -std=c++17 circular_queue.cpp -o circular_queue`.
3. Run: `./circular_queue`.
4. Observe the output. Note that `40` was successfully enqueued after `10` was dequeued, proving the `rear` pointer successfully wrapped around to index 0.

---

## Concept Unit: Queue via Two Pointers (Linked List)

### The Problem
A circular array queue is incredibly fast but has a strict memory limit; if you guess the capacity wrong, you must reject incoming items or write complex resizing logic. You need a queue that can grow infinitely without shifting data, adding and removing items on demand.

### The New Code
```cpp
#include <iostream>

struct Node {
    int value;
    Node* next;
};

class LinkedQueue {
private:
    Node* head;
    Node* tail;

public:
    LinkedQueue() {
        head = nullptr;
        tail = nullptr;
    }

    ~LinkedQueue() {
        while (head != nullptr) {
            dequeue();
        }
    }

    void enqueue(int val) {
        Node* newNode = new Node{val, nullptr};
        if (tail == nullptr) {
            head = newNode;
            tail = newNode;
        } else {
            tail->next = newNode;
            tail = newNode;
        }
    }

    int dequeue() {
        if (head == nullptr) {
            std::cout << "Queue is empty!\n";
            return -1;
        }
        Node* temp = head;
        int val = temp->value;
        head = head->next;
        
        if (head == nullptr) {
            tail = nullptr;
        }
        
        delete temp;
        return val;
    }
};

int main() {
    LinkedQueue q;
    q.enqueue(100);
    q.enqueue(200);
    
    std::cout << "Dequeued: " << q.dequeue() << "\n";
    std::cout << "Dequeued: " << q.dequeue() << "\n";
    
    return 0;
}
```

### The Updated Project
No reference counterpart — this is a from-scratch addition. The `LinkedQueue` builds upon the singly linked list concepts from Lesson 04, adding a dedicated `tail` pointer to enforce efficient FIFO behavior.

### Mechanical Walkthrough
- `Node* head;`: Points to the front of the queue, representing the oldest item to be dequeued next.
- `Node* tail;`: Points to the very end of the queue, representing the newest item.
- `Node* newNode = new Node{val, nullptr};`: Allocates a fresh node on the heap for the incoming value.
- `if (tail == nullptr)`: Checks if the queue is totally empty. If it is, both `head` and `tail` must point to this very first node.
- `tail->next = newNode;`: The crucial O(1) linkage. Instead of traversing the entire list from `head` to find the end, we use the `tail` pointer to instantly link the new node onto the back.
- `tail = newNode;`: Updates the `tail` pointer itself so it points to the new end of the line.
- `head = head->next;`: Disconnects the oldest node by moving the `head` pointer to the second node in line.
- `if (head == nullptr)`: Checks if we just dequeued the very last item. If we did, `tail` must also be reset to `nullptr` so it doesn't point to deleted memory.
- `delete temp;`: Frees the heap memory of the node we just removed.

### CS Lens
This is a singly linked list optimized for queue operations. By maintaining a `tail` pointer, enqueue operations bypass the O(N) traversal normally required to append to a list, guaranteeing O(1) performance for both insertions and removals.

### SE Lens
The alternative not chosen is using a single `head` pointer and walking to the end of the list on every insertion. The tradeoff here is one extra pointer (`tail`) of memory per queue in exchange for turning a slow O(N) append into a blindingly fast O(1) append. In systems processing millions of events, that traversal cost is unacceptable, making the `tail` pointer mandatory.

### Run It Yourself
1. Save the code in `linked_queue.cpp`.
2. Compile: `g++ -std=c++17 linked_queue.cpp -o linked_queue`.
3. Run: `./linked_queue`.
4. Observe the output: the values come out exactly in the 100, 200 order they went in.

---

## Concept Unit: `std::queue`

### The Problem
You understand how a queue operates mechanically, but writing manual circular modulo math or raw pointer logic in every project is prone to off-by-one errors and memory leaks. You need a reliable, pre-built, heavily tested queue from the C++ standard library that manages memory safely.

### The New Code
```cpp
#include <iostream>
#include <queue>
#include <string>

int main() {
    std::queue<std::string> tasks;
    
    tasks.push("Parse Config");
    tasks.push("Connect Database");
    tasks.push("Start Server");
    
    while (!tasks.empty()) {
        std::cout << "Executing: " << tasks.front() << "\n";
        tasks.pop();
    }
    
    return 0;
}
```

### The Updated Project
No reference counterpart — this proves the standard library container adapter `std::queue` in isolation.

### Mechanical Walkthrough
- `#include <queue>`: Instructs the compiler to include the standard library file defining `std::queue`.
- `std::queue<std::string> tasks;`: Declares a queue that will hold strings. 
- `tasks.push("Parse Config");`: Enqueues the string at the back. It automatically allocates the necessary memory.
- `tasks.empty()`: A boolean method that returns `true` if the queue has zero elements. The `!` operator negates it, so the loop runs as long as there is work to do.
- `tasks.front()`: Reads the value at the very front of the queue. Unlike our custom `dequeue()`, this *does not* remove the item. It only provides read access to the oldest element.
- `tasks.pop()`: Removes the item at the front of the queue, destructing the string and freeing its memory. It deliberately returns `void`.

### CS Lens
`std::queue` is a container adapter. It is not a data structure itself; instead, it wraps an existing sequence container (by default, `std::deque`) and completely hides methods like `push_front` or `[]` operator access. It strictly enforces FIFO rules by only exposing `push`, `pop`, and `front`.

### SE Lens
The alternative not chosen is returning the value directly from `pop()`, which is how our custom implementations worked. The standard library separates `front()` (read) and `pop()` (remove) into two distinct methods for exception safety. If `pop()` returned a value, and the copy constructor of that value threw an exception while being returned, the item would be deleted from the queue but never successfully received by the caller—resulting in permanent data loss. By separating the read and the removal, the C++ standard library eliminates this risk.

### Run It Yourself
1. Save the code in `std_queue.cpp`.
2. Compile: `g++ -std=c++17 std_queue.cpp -o std_queue`.
3. Run: `./std_queue`.
4. Observe the output: the tasks print strictly in the order they were pushed.

---

## Connect the Pieces

Whether backed by a circular array, a linked list with two pointers, or a standard library container adapter, the strict contract of a Queue never changes: FIFO. Data enters at the back (`enqueue` / `push`) and leaves from the front (`dequeue` / `pop` and `front`). The underlying memory layout is completely hidden from the code consuming the queue.

## What Breaks Without This

If you try to cheat the queue order, the compiler or runtime stops you. 
Modify the `std::queue` code to attempt to read the second element directly:
```cpp
std::cout << tasks[1];
```

**The compiler error:**
`error: no match for 'operator[]' in 'tasks[1]'`

Because `std::queue` enforces strict FIFO constraints, it deliberately deletes the `[]` operator. You cannot skip the line. If you want the second item, you must `pop()` the first item.

## Exercises

1. **Circular Check:** Modify the `CircularQueue` to hold strings instead of integers. Enqueue three strings, dequeue two, and enqueue two more to prove it wraps around correctly.
2. **Linked Peek:** Add a `front_value()` method to the `LinkedQueue` that returns the value of the head node without deleting it, mirroring `std::queue::front()`.
3. **Task Scheduler:** Use `std::queue` to simulate a printer queue. Push five document names into the queue, then write a loop that pops and prints each one, stating it is "printing".

## Definition of Done

- [ ] You have compiled and run a Circular Array queue and observed index wrapping.
- [ ] You have compiled and run a Two-Pointer Linked list queue and observed O(1) removal.
- [ ] You have compiled and run `std::queue` and understand why reading and removing are split into two methods.
- [ ] You can explain out loud why a `tail` pointer is necessary for a linked list queue.
- [ ] You have committed your code with a message explaining why FIFO is required for task scheduling.
