# Lesson 06: Stack

**What you will build:** You will implement a Last-In, First-Out (LIFO) stack from scratch using a singly linked list, exploring how strictly controlling access to data guarantees order. Then, you will visualize how the C++ language itself relies on a stack to manage function calls, before finally using the Standard Library's production-ready `std::stack`. The transferable problem this solves is managing strictly nested operations like undo histories, syntax parsing, or execution pausing.

**What you need to know first:** Lesson 04 Singly Linked List.

**Terms used in this lesson:**
- **Stack** — A data structure that strictly enforces Last-In, First-Out (LIFO) access. *Why it exists:* To track state where the most recently added item must be processed before older items, preventing arbitrary mid-collection modifications.
- **LIFO (Last-In, First-Out)** — The semantic rule dictating that the last element added to a collection is the first one removed. *Why it exists:* To guarantee that nested operations unwind in exact reverse order.
- **Call Stack** — The internal memory structure the runtime uses to track active functions. *Why it exists:* So that when a function finishes, the CPU knows exactly which line of code in the calling function to resume execution from.

**Objects and methods used:**
- **`std::stack<T>` / `push`**
  - *What it is:* A container adapter that restricts underlying container access to strictly LIFO semantics.
  - *Implementation:* `void push(const T& value);`
  - *Its use:* Adds an element to the top of the stack.
- **`std::stack<T>` / `pop`**
  - *What it is:* A method that removes the top element.
  - *Implementation:* `void pop();`
  - *Its use:* Discards the most recently added item. It returns `void`, meaning you must peek at the value before popping if you need it.
- **`std::stack<T>` / `top`**
  - *What it is:* A method that inspects the top element.
  - *Implementation:* `T& top();`
  - *Its use:* Retrieves a reference to the top element without removing it from the collection.

---

## Concept Unit: Implementing LIFO over a Linked List

### The Problem
If you have a collection of actions (like a user's text edits) and they click "Undo", you must reverse the very last edit they made, not the first one. A raw array or linked list allows inserting and deleting anywhere, which is too permissive. You need a data structure that explicitly forbids accessing anything except the most recently added item.

### The New Code
```cpp
#include <iostream>
#include <stdexcept>

struct Node {
    int data;
    Node* next;
};

class LinkedStack {
private:
    Node* head = nullptr;

public:
    void push(int value) {
        Node* newNode = new Node{value, head};
        head = newNode;
    }

    void pop() {
        if (head == nullptr) return;
        Node* oldHead = head;
        head = head->next;
        delete oldHead;
    }

    int peek() const {
        if (head == nullptr) throw std::runtime_error("Stack is empty");
        return head->data;
    }

    bool isEmpty() const {
        return head == nullptr;
    }

    ~LinkedStack() {
        while (!isEmpty()) {
            pop();
        }
    }
};

int main() {
    LinkedStack stack;
    stack.push(10);
    stack.push(20);
    stack.push(30);

    std::cout << "Top is: " << stack.peek() << "\n";
    stack.pop();
    std::cout << "Top after pop is: " << stack.peek() << "\n";

    return 0;
}
```

### The Updated Project
This is a standalone throwaway script `stack_impl.cpp`. It defines a custom `LinkedStack` class that wraps a singly linked list, hiding the list's generic abilities and exposing only `push`, `pop`, and `peek`.

### Mechanical Walkthrough
- `#include <stdexcept>`: Brings in standard exception types like `std::runtime_error`.
- `struct Node`: The familiar linked list node containing an integer and a pointer to the next node.
- `Node* head = nullptr;`: A private pointer to the first node in the linked list. In stack terminology, the head of the list represents the "top" of the stack.
- `void push(int value)`: The method signature for adding an item to the top.
- `Node* newNode = new Node{value, head};`: Allocates a new node on the heap. Its `data` becomes the passed value, and its `next` pointer is set to the current `head`.
- `head = newNode;`: Updates the `head` pointer to point to this brand-new node. The new node is now at the absolute front of the list, hiding the older nodes behind its `next` pointer.
- `void pop()`: The method signature for removing the top item.
- `if (head == nullptr) return;`: Guards against popping an empty stack, preventing a crash from trying to read a null pointer.
- `Node* oldHead = head;`: Temporarily saves the address of the current top node.
- `head = head->next;`: Moves the `head` pointer down one position, effectively forgetting the top node and making the second node the new top.
- `delete oldHead;`: Frees the memory of the node we just removed. Because we saved its address in `oldHead`, we can safely delete it after moving `head`.
- `int peek() const`: The method signature for reading the top item without removing it.
- `if (head == nullptr) throw std::runtime_error("Stack is empty");`: Throws an exception if the caller tries to peek at an empty stack, as there is no valid integer to return.
- `return head->data;`: Returns the integer stored in the top node without altering the `head` pointer, leaving the stack's state unchanged.
- `bool isEmpty() const`: Returns `true` if the stack has no items.
- `return head == nullptr;`: Checks if the head pointer is null.
- `~LinkedStack()`: The destructor automatically loops while the stack is not empty, calling `pop()` repeatedly to free all allocated nodes when the stack goes out of scope.
- `stack.push(10);`: Pushes `10` onto the stack.
- `stack.pop();`: Removes the top element.

### CS Lens
This structure strictly forces O(1) constant time for both insertion and removal. Because every operation only ever touches the `head` pointer, the stack never has to traverse the rest of the list. It takes the exact same amount of time to push or pop whether the stack has zero items or a million.

### SE Lens
The design principle here is encapsulation. A linked list can theoretically insert or delete at any position. By making `head` private and only writing `push` and `pop` methods, `LinkedStack` guarantees to the rest of the program that its LIFO semantics cannot be violated. You cannot accidentally delete the middle item because there is no method exposed that allows it.

### Run It Yourself
1. Create `stack_impl.cpp` with the code above.
2. Compile: `g++ -std=c++17 stack_impl.cpp -o stack_impl`
3. Run: `./stack_impl`
4. Observe the output:
   Top is: 30
   Top after pop is: 20

---

## Concept Unit: The Call Stack

### The Problem
When `main()` calls `functionA()`, and `functionA()` calls `functionB()`, the computer must pause `main()`, execute `functionA()`, pause `A`, execute `B`, and then un-pause `A` exactly where it left off. You need to understand how the operating system uses LIFO semantics to track this execution order.

### The New Code
```cpp
#include <iostream>

void functionB() {
    std::cout << "Inside B\n";
}

void functionA() {
    std::cout << "Entering A\n";
    functionB();
    std::cout << "Exiting A\n";
}

int main() {
    std::cout << "Starting main\n";
    functionA();
    std::cout << "Ending main\n";
    return 0;
}
```

### The Updated Project
This is a standalone throwaway script `call_stack.cpp` containing three simple nested functions.

### Mechanical Walkthrough
1. `main()` starts — The OS pushes the `main` function onto the internal Call Stack.
2. `std::cout << "Starting main\n";` — Executes normally.
3. `functionA();` — `main()` pauses. The OS pushes the memory address of the next line inside `main` onto the Call Stack, and control jumps to `functionA`. The top of the stack is now `functionA`.
4. `std::cout << "Entering A\n";` — Executes inside `A`.
5. `functionB();` — `functionA` pauses. The OS pushes `functionA`'s return address onto the stack. Control jumps to `functionB`. The top of the stack is now `functionB`.
6. `std::cout << "Inside B\n";` — Executes inside `B`.
7. `functionB()` finishes — The OS pops the top frame off the Call Stack. It sees the return address for `functionA` and jumps back there.
8. `std::cout << "Exiting A\n";` — `A` resumes and finishes.
9. `functionA()` finishes — The OS pops the top frame again, revealing `main`'s return address, and jumps back to `main`.
10. `std::cout << "Ending main\n";` — `main` resumes and finishes.

### CS Lens
The Call Stack proves that LIFO isn't just an abstract data structure; it is the fundamental mechanism that makes modern procedural programming possible. Without a stack, a language could not support functions calling other functions, because it would have no way to remember the sequence of return addresses. If a stack frame grows too large or too many nested calls occur (like infinite recursion), the stack runs out of memory, causing a "Stack Overflow."

### SE Lens
The alternative not chosen in early computing history was statically allocating all function variables globally. The tradeoff there meant functions could not be re-entrant (a function could not safely call itself) because the global variables would be overwritten. A stack allocates fresh memory (a "stack frame") for local variables every time a function is pushed, explicitly enabling recursion.

### Run It Yourself
1. Create `call_stack.cpp` with the code above.
2. Compile: `g++ -std=c++17 call_stack.cpp -o call_stack`
3. Run: `./call_stack`
4. Trace the output and verify the exact order matches the LIFO unwind sequence.

---

## Concept Unit: `std::stack`

### The Problem
Writing a custom `LinkedStack` class requires manual memory management and is prone to bugs. When you need a stack in a real project, you should use a battle-tested, production-ready container from the C++ Standard Library instead of writing your own.

### The New Code
```cpp
#include <iostream>
#include <stack>
#include <string>

int main() {
    std::stack<std::string> browserHistory;

    browserHistory.push("Home Page");
    browserHistory.push("Search Results");
    browserHistory.push("Article Page");

    std::cout << "Currently viewing: " << browserHistory.top() << "\n";
    
    browserHistory.pop(); // Click the 'Back' button
    
    std::cout << "Went back. Now viewing: " << browserHistory.top() << "\n";

    return 0;
}
```

### The Updated Project
This is a standalone script `std_stack.cpp` demonstrating the C++ standard library adapter.

### Mechanical Walkthrough
- `#include <stack>`: Instructs the compiler to include the standard library file containing the `std::stack` adapter.
- `std::stack<std::string> browserHistory;`: Declares a standard stack that holds strings. Under the hood, this doesn't implement its own data structure; it uses another container (by default, `std::deque`) and restricts its interface to only allow stack operations.
- `browserHistory.push("Home Page");`: Adds the string to the top of the stack.
- `browserHistory.push("Search Results");`: Adds the next string to the top.
- `browserHistory.push("Article Page");`: Adds the final string to the top.
- `browserHistory.top()`: Returns a reference to the element at the absolute top of the stack. Unlike our custom `peek()`, the standard library names this method `top()`.
- `browserHistory.pop()`: Removes the top element. Crucially, in C++, `pop()` returns `void`. It deletes the top element but does not give it back to you. If you need the value, you must call `top()` before calling `pop()`.

### CS Lens
This is known as the Command-Query Separation principle. The C++ standard library splits looking at the data (Query: `top()`) from mutating the data (Command: `pop()`). If `pop()` returned the value by value, it would require copying the object. If the copy constructor threw an exception, the item would be permanently lost from the stack but never received by the caller. Splitting them makes the structure exception-safe.

### SE Lens
The standard library implemented `std::stack` as a "container adapter", not a container. By default, it wraps a `std::deque` (double-ended queue), but you can optionally tell it to wrap a `std::vector` or a `std::list`. The tradeoff here is maximum reusability. Instead of writing duplicate logic for different memory layouts, the library developers wrote the LIFO logic once and let it adapt to existing sequence containers.

### Run It Yourself
1. Create `std_stack.cpp` with the code above.
2. Compile: `g++ -std=c++17 std_stack.cpp -o std_stack`
3. Run: `./std_stack`
4. Observe the output:
   Currently viewing: Article Page
   Went back. Now viewing: Search Results

---

## Connect the Pieces

A stack enforces exactly one invariant: the last item pushed is the first item popped. We saw this implemented mechanically using a `head` pointer in a linked list, conceptually by the operating system pausing and resuming `functionA` and `functionB`, and practically using `std::stack` for browser history. Because the access pattern is strictly limited, stacks guarantee predictable unwinding.

## What Breaks Without This

If you try to iterate over a `std::stack` like a vector, the compiler will fail.

Modify the `std_stack.cpp` code to include a for-loop:
```cpp
for (const auto& page : browserHistory) {
    std::cout << page << "\n";
}
```

**The compiler error:**
`error: invalid range expression of type 'std::stack<std::string>'; no viable 'begin' function available`

A true stack does not have iterators. You are not allowed to scan through its elements, search for an item in the middle, or view the bottom item. If you need to do those things, a stack is the wrong data structure. The compiler enforces the LIFO contract by refusing to compile attempts to bypass the top.

## Exercises

1. **Balanced Parentheses:** Write a script using `std::stack<char>`. Loop through the string `"( ( a + b ) * c )"`. Push every `(` onto the stack, and pop one off for every `)`. If the stack is empty at the end, the parentheses are balanced.
2. **Reverse a String:** Read a word from `std::cin`. Push every character of the string onto a `std::stack<char>`. Then, `pop` and print them one by one until the stack is empty. Verify the string prints backwards.

## Definition of Done

- [ ] You have implemented LIFO semantics over a linked list using `push`, `pop`, and `peek`.
- [ ] You can trace the Call Stack's execution order through nested function calls.
- [ ] You have compiled and run a script using `std::stack` and successfully retrieved items using `top()` before `pop()`.
- [ ] You can explain out loud why `std::stack::pop()` returns `void` instead of the value.
