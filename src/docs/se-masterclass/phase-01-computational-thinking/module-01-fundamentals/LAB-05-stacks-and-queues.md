# SE Masterclass — LAB-05 — Stacks and Queues

**Language: C++**
*Why C++ here:* `std::stack<T>` and `std::queue<T>` from the C++ Standard Template Library expose the data structure operations without hiding the types. C++ also introduces manual compilation, `#include`, namespaces, and template syntax `<T>` — concepts that appear across all compiled languages. C++ teaches: `#include`, `std::stack`, `std::queue`, `using namespace std`, `g++` compilation, and the `->` operator.

**Prerequisites:** LAB-04 (Objects and Hash Maps — Java).
This lab introduces a third compiled language and two data structures with contrasting access patterns.

**What this lab adds:**
- Stack: LIFO (Last In, First Out) — push and pop
- Queue: FIFO (First In, First Out) — push and pop from opposite ends
- The call stack: how your CPU tracks function calls
- How to compile and run C++ with `g++`
- Template types: `std::stack<int>`, `std::queue<std::string>`

**Time:** 60–80 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A stack of plates — you always take from the top. What does "LIFO" mean and why does a plate stack demonstrate it?
> 2. A queue at a coffee shop — first person in line is first served. What does "FIFO" mean?
> 3. If you push `1`, `2`, `3` onto a stack and then pop three times, in what order do you get the values?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, compiling and running `main.cpp` prints:

```
=== Stack: Push ===
pushed: 10
pushed: 20
pushed: 30
top: 30

=== Stack: Pop ===
popped: 30
popped: 20
popped: 10
stack is empty

=== Queue: Enqueue ===
enqueued: alice
enqueued: bob
enqueued: carol
front: alice

=== Queue: Dequeue ===
served: alice
served: bob
served: carol
queue is empty

=== Undo Stack ===
do: type 'hello'
do: type ' world'
do: select all
undo: select all
undo: type ' world'
current state: type 'hello'
```

---

### Language: C++ Basics

Before writing any code, here is the C++ setup and syntax used in this lab.

**Compiling and running C++:**

```
g++ main.cpp -o main       # compile: g++ reads main.cpp, produces executable 'main'
./main                     # run: execute the compiled binary (Linux/macOS)
main.exe                   # run on Windows (or just: main)
```

On Windows with MinGW or MSVC, use:
```
g++ main.cpp -o main.exe
main.exe
```

**Verifying your compiler:**

```
g++ --version
```

If not found: on Windows, install MinGW-w64 via https://winlibs.com or the MSYS2 installer. On macOS: `xcode-select --install`. On Linux: `sudo apt install g++`.

**Required structure:**

```cpp
#include <iostream>   // brings std::cout into scope

int main() {
    std::cout << "Hello, world!" << std::endl;
    return 0;         // 0 means "success" — the OS reads this exit code
}
```

**`#include` — importing headers:**

```cpp
#include <iostream>   // input/output: cout, cin
#include <stack>      // std::stack<T>
#include <queue>      // std::queue<T>
#include <string>     // std::string
```

**`using namespace std;` — optional shorthand:**

```cpp
using namespace std;
cout << "hello" << endl;   // instead of: std::cout << "hello" << std::endl;
```

This saves typing but pollutes the global namespace. In larger projects, prefer
`std::` prefixes. In this lab, we will use `using namespace std;` for brevity.

**Template types:**

```cpp
std::stack<int>         // a stack that holds integers
std::queue<std::string> // a queue that holds strings
```

The `<T>` angle-bracket syntax is called a **template parameter** — it specifies
what type the container holds. The compiler generates specialized code for each type.

---

## Step 1 — First C++ Program

Create a folder `lab-05`. Inside it, create `main.cpp`:

```cpp
#include <iostream>

using namespace std;

int main() {
    cout << "=== Stack: Push ===" << endl;
    return 0;
}
```

### SAVE AND TRY

Compile and run:

```
g++ main.cpp -o main
./main
```

**You should see:**

```
=== Stack: Push ===
```

**In the terminal:**

```
g++ --version
```

**Expected:** `g++ (GCC) 12.x.x` or similar. Any version from GCC 7+ is sufficient.

**Change something:** Remove `return 0;`. Compile. Run. On most compilers, this still works — C++ allows omitting `return 0` from `main`. Put it back — explicit `return 0` is conventional and shows intent.

---

### Concept: The Stack — LIFO Access

**What it is:** A stack is a container where the last item pushed in is the first item popped out. You can only access the top element. Push adds to the top. Pop removes from the top.

**The problem before:**

Imagine undo in a text editor. Every action needs to be reversible in reverse order.
You cannot undo action 1 before undoing action 3 — the most recent change must be
undone first. A simple array with a loop does not enforce this; you could accidentally
undo things in the wrong order.

**The solution:** A stack enforces LIFO automatically:

```cpp
stack<string> history;
history.push("typed 'hello'");
history.push("typed ' world'");
// undo the most recent:
history.top();    // "typed ' world'" — peek without removing
history.pop();    // removes "typed ' world'"
history.top();    // "typed 'hello'" — now this is on top
```

**Canonical example (General Explanation):**

Think of a stack of plates at a buffet. You always take the plate on top. When
clean plates are added, they go on top. The plate at the bottom — the first one
placed — is the last one taken. LIFO: Last In, First Out.

**The C++ stack interface:**

```cpp
stack<int> s;
s.push(10);     // add to top
s.top();        // peek at top without removing — returns reference to top element
s.pop();        // remove from top (returns nothing — use top() first to read the value)
s.empty();      // true if no elements remain
s.size();       // number of elements
```

**Project Application (The "Why" here):**

The call stack is a stack. Every function call pushes a frame; every return pops
it. In LAB-10 (Expression Evaluator), you use a stack to convert infix to postfix
and to evaluate postfix expressions. In LAB-06 (Trees/Graphs), DFS (depth-first
search) uses a stack. In any editor, undo history is a stack.

**Smallest possible example:**

```cpp
stack<int> s;
s.push(1);
s.push(2);
s.push(3);
cout << s.top() << endl;   // 3
s.pop();
cout << s.top() << endl;   // 2
```

**Why it matters here:** Stacks are the building block for parsers, evaluators,
and traversals. Their enforced LIFO constraint prevents the class of bugs where
operations are applied out of order.

**Watch for:** In C++, `pop()` does NOT return the value — it only removes.
You must call `top()` first to read the value, then `pop()` to discard it.
In Python's list, `pop()` returns and removes. In C++ stack, they are separate.

---

## Step 2 — Stack Push

Add to `main.cpp`:

```cpp
#include <iostream>
#include <stack>       // ← add: brings std::stack into scope

using namespace std;

int main() {
    cout << "=== Stack: Push ===" << endl;

    stack<int> s;          // ← add: declare a stack that holds integers
    s.push(10);            // ← add: push adds to the top
    cout << "pushed: 10" << endl;
    s.push(20);            // ← add
    cout << "pushed: 20" << endl;
    s.push(30);            // ← add
    cout << "pushed: 30" << endl;

    cout << "top: " << s.top() << endl;   // ← add: top() peeks without removing

    return 0;
}
```

### SAVE AND TRY

```
g++ main.cpp -o main
./main
```

**You should see:**

```
=== Stack: Push ===
pushed: 10
pushed: 20
pushed: 30
top: 30
```

**In the terminal:**

```
g++ -std=c++17 main.cpp -o main && ./main
```

**Expected:** Same output. `-std=c++17` explicitly sets the C++ standard version. C++17 is the minimum recommended for all labs in this curriculum.

**Change something:** Add `s.push(40)` after `s.push(30)`. What is `top()` now? Run it. The top is now `40`. Remove that line.

---

## Step 3 — Stack Pop

Add to `main` (after the push section):

```cpp
cout << "\n=== Stack: Pop ===" << endl;

while (!s.empty()) {                         // ← add: loop until the stack is empty
    cout << "popped: " << s.top() << endl;   // ← add: read the top BEFORE popping
    s.pop();                                 // ← add: pop() removes — returns nothing
}

cout << "stack is empty" << endl;            // ← add
```

### SAVE AND TRY

Compile and run.

**You should see:**

```
=== Stack: Pop ===
popped: 30
popped: 20
popped: 10
stack is empty
```

**In the terminal:**

```
g++ -Wall -std=c++17 main.cpp -o main 2>&1
```

**Expected:** No warnings. `-Wall` enables all common warnings. If you see any, they are worth understanding.

**Change something:** Call `s.top()` after the loop (when the stack is empty). Compile. Run. This is **undefined behavior** in C++ — you might see garbage, a crash, or no error at all. The program is wrong but the compiler may not catch it. Remove that line and compile again.

---

### Concept: The Queue — FIFO Access

**What it is:** A queue is a container where the first item pushed in is the first item popped out. Items enter at the back. Items leave from the front. FIFO: First In, First Out.

**The problem before:**

```
// Processing requests in the order they arrived:
// Without a queue, you might process the most recent request first
// — which is unfair and wrong for things like print jobs, task schedulers, etc.
```

**The solution:** A queue enforces FIFO automatically:

```cpp
queue<string> line;
line.push("alice");    // alice arrives first
line.push("bob");      // bob arrives second
line.front();          // "alice" — she arrived first, served first
line.pop();            // removes alice from the front
line.front();          // "bob" — now he is first
```

**Canonical example (General Explanation):**

Think of a coffee shop queue. The first person in line is the first person served.
New people join at the back. FIFO ensures fairness — nobody waits forever.

**The C++ queue interface:**

```cpp
queue<string> q;
q.push("alice");    // add to back
q.front();          // peek at front (the next to be served)
q.back();           // peek at back (the most recently added)
q.pop();            // remove from front (returns nothing — use front() first)
q.empty();          // true if no elements
q.size();           // number of elements
```

**Project Application (The "Why" here):**

Queues are used in: BFS (breadth-first search) in LAB-06, task schedulers in
operating systems, message queues in distributed systems (LAB-80), and the
event loop in every JavaScript runtime (which is why callbacks run in order).

**Smallest possible example:**

```cpp
queue<int> q;
q.push(1);
q.push(2);
q.push(3);
cout << q.front() << endl;   // 1 — FIFO: first in
q.pop();
cout << q.front() << endl;   // 2
```

**Why it matters here:** The contrast with stacks is the lesson. Same operations
(push, pop, peek), different sides of access — completely different behavior and use cases.

**Watch for:** Like `stack`, C++ `queue::pop()` does NOT return the value.
Call `front()` to read, then `pop()` to remove. Same pattern as the stack.

---

## Step 4 — Queue

Add to `main` (after the stack section):

```cpp
#include <queue>       // ← add at top of file with other includes
#include <string>      // ← add at top of file (needed for std::string)
```

Add to `main` body:

```cpp
cout << "\n=== Queue: Enqueue ===" << endl;

queue<string> q;            // ← add: a queue that holds strings
q.push("alice");            // ← add: push adds to the BACK of the queue
cout << "enqueued: alice" << endl;
q.push("bob");              // ← add
cout << "enqueued: bob" << endl;
q.push("carol");            // ← add
cout << "enqueued: carol" << endl;

cout << "front: " << q.front() << endl;   // ← add: front() peeks at the next to be served

cout << "\n=== Queue: Dequeue ===" << endl;

while (!q.empty()) {                           // ← add
    cout << "served: " << q.front() << endl;   // ← add: read front BEFORE popping
    q.pop();                                   // ← add: removes from the FRONT
}

cout << "queue is empty" << endl;              // ← add
```

### SAVE AND TRY

Compile and run.

**You should see:**

```
=== Queue: Enqueue ===
enqueued: alice
enqueued: bob
enqueued: carol
front: alice

=== Queue: Dequeue ===
served: alice
served: bob
served: carol
queue is empty
```

**In the terminal:**

```
echo "alice bob carol" | tr ' ' '\n'
```

**Expected:**
```
alice
bob
carol
```

This is unrelated to C++ — it is a terminal tool for splitting text. The queue served people in the same order. Understanding the conceptual FIFO relationship between the queue and the line is the goal.

**Change something:** Replace `queue<string>` with `stack<string>` and change `q.front()` to `q.top()`. Compile and run. You see carol served first — LIFO. This is the exact difference between the two structures. Change it back to `queue`.

---

## 🎯 Challenge: Undo Stack

**You know:** A stack enforces LIFO. You push operations as they happen, and pop them to undo.

**Task:** Build an undo system. Create a `stack<string>` called `history`. Push three "do" actions onto it, printing each. Then pop and print two "undo" operations, then print the remaining top as "current state".

**Starting code:**

```cpp
stack<string> history;

// TODO: push these three actions (and print "do: <action>" for each):
// "type 'hello'"
// "type ' world'"
// "select all"

// TODO: undo the last two actions (print "undo: <action>" for each)
// Reminder: read top() FIRST, then pop()

// TODO: print "current state: " + history.top()

// Expected output:
// do: type 'hello'
// do: type ' world'
// do: select all
// undo: select all
// undo: type ' world'
// current state: type 'hello'
```

---

<details>
<summary>▶ Show Solution</summary>

```cpp
stack<string> history;

history.push("type 'hello'");
cout << "do: type 'hello'" << endl;

history.push("type ' world'");
cout << "do: type ' world'" << endl;

history.push("select all");
cout << "do: select all" << endl;

cout << "undo: " << history.top() << endl;
history.pop();

cout << "undo: " << history.top() << endl;
history.pop();

cout << "current state: " << history.top() << endl;
```

**Key insight:** The stack's LIFO constraint is what makes undo correct by
construction. You do not need to track an index or check order — the structure
enforces it. In LAB-10 (Expression Evaluator), you will use this exact pattern:
operators are pushed onto an operator stack, and when a closing parenthesis is
encountered, operators are popped in reverse order to build the expression tree.
The stack handles the nesting automatically.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `g++ main.cpp -o main` compiles without errors | No red text in terminal |
| Stack push: top is `30` after pushing 10, 20, 30 | Prints `top: 30` |
| Stack pop: values come out 30, 20, 10 | LIFO order confirmed |
| Queue enqueue: front is `alice` | First enqueued is at front |
| Queue dequeue: served in alice, bob, carol order | FIFO order confirmed |
| Undo challenge: undoes "select all" then "type ' world'" | Correct LIFO undo order |
| You can explain why `pop()` must be called after `top()` in C++ | `pop()` returns void — you must read before discarding |
| You can explain the difference between stack and queue access | LIFO vs FIFO — same operations, different sides |

---

## Quick Check Answers

**1. What does "LIFO" mean?**

Last In, First Out. The last item placed on the stack is the first item removed.
A plate stack: you add plates to the top, you take plates from the top. The plate
placed most recently (last in) is the plate taken next (first out). This was
demonstrated in Step 3: pushed 10, 20, 30 — popped 30, 20, 10.

**2. What does "FIFO" mean?**

First In, First Out. The first item added is the first item removed. A coffee shop
queue: the first person to arrive is the first person served. Demonstrated in Step 4:
enqueued alice, bob, carol — served alice, bob, carol in that same order.

**3. If you push 1, 2, 3 onto a stack and pop three times, in what order?**

3, 2, 1. Each `pop()` removes the top element. After pushing 1, 2, 3, the top is 3.
Pop returns 3 (top). Now top is 2. Pop returns 2. Now top is 1. Pop returns 1.
Stack empty. This is the call stack in your CPU — the most recently called function
is the first to return.

---

*Next: [LAB-06 — Trees and Graphs](LAB-06-trees-and-graphs.md) — C++*
