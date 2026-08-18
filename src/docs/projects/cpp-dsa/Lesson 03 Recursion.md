# Lesson 03: Recursion

**What you will build:** You will write isolated console programs that solve problems by having a function call itself. You will inspect the call stack, force a stack overflow, and convert a recursive function into an iterative one. The transferable problem this solves is breaking down self-similar problems (like traversing trees or directories) into simpler sub-problems using C++.

**What you need to know first:** C++ From Scratch (Lessons 01–35).

**Terms used in this lesson:**
- **Recursion** — A technique where a function calls itself. *Why it exists:* To cleanly express algorithms that operate on recursively structured data, like trees or graphs, without complex manual loop state.
- **Base Case** — The condition under which a recursive function stops calling itself and returns. *Why it exists:* To prevent the function from calling itself infinitely, which would exhaust system memory.
- **Recursive Case** — The part of a recursive function that performs a piece of work and then calls the function again with a smaller or simpler input. *Why it exists:* To incrementally move the problem closer to the base case.
- **Call Stack** — The hidden, internal data structure the operating system uses to keep track of active function calls, their arguments, and local variables. *Why it exists:* To know exactly where to return and what state to restore when a function finishes executing.
- **Stack Overflow** — A fatal program crash caused by the call stack growing too large and exceeding its allocated memory. *Why it exists:* It is the hardware and operating system's defense mechanism against a runaway program consuming all system memory.
- **Tail Recursion** — A specific form of recursion where the recursive call is the absolute last operation in the function. *Why it exists:* To allow modern compilers to optimize the code into a simple jump instead of allocating a new stack frame, preventing stack overflows.

**Objects and methods used:**
No external standard library objects or methods are the primary subject of this lesson. We will use basic C++ functions to demonstrate these computer science concepts from scratch.

---

## Concept Unit: The Recursive Function

### The Problem
Some problems, like calculating a factorial or traversing a nested file directory, are inherently self-referential. A factorial of $N$ is $N$ multiplied by the factorial of $N-1$. Writing this as a standard `for` loop requires you to manually track the running product. You need a way to express this mathematical self-reference directly in code.

### The New Code
```cpp
#include <iostream>

int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    int result = factorial(4);
    std::cout << "Factorial of 4 is: " << result << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `int factorial(int n)`: A freestanding function that takes an integer and returns an integer.
- `if (n <= 1)`: This is the **base case**. It checks if the input has reached the smallest valid problem size.
- `return 1;`: If the base case is met, the function immediately returns a hardcoded value, terminating this specific branch of execution without making any further calls.
- `return n * factorial(n - 1);`: This is the **recursive case**. The function halts its own execution, suspends its current state (holding onto `n`), and invokes a brand new instance of `factorial` with an argument one smaller than its own. It waits for that new instance to return a value, multiplies that returned value by its own `n`, and returns the final product.
- `factorial(4)`: The initial invocation from `main()`.

1. `factorial(4)` — checks `4 <= 1` (false), attempts to return `4 * factorial(3)`. Pauses to call `factorial(3)`.
2. `factorial(3)` — checks `3 <= 1` (false), attempts to return `3 * factorial(2)`. Pauses to call `factorial(2)`.
3. `factorial(2)` — checks `2 <= 1` (false), attempts to return `2 * factorial(1)`. Pauses to call `factorial(1)`.
4. `factorial(1)` — checks `1 <= 1` (true), returns `1`.
5. `factorial(2)` — resumes, computes `2 * 1`, returns `2`.
6. `factorial(3)` — resumes, computes `3 * 2`, returns `6`.
7. `factorial(4)` — resumes, computes `4 * 6`, returns `24`.

### CS Lens
This is recursion. It maps cleanly to mathematical induction. You define a base truth, and you define how to compute the next step using the previous step. 

### SE Lens
The alternative not chosen is a `while` or `for` loop that mutates a single variable `total *= i`. The tradeoff here is readability versus overhead. A loop is faster and uses less memory, but for complex data structures like trees, recursion is significantly shorter and less error-prone to write than managing a manual stack of nodes to visit.

### Run It Yourself
1. Save the code in `recursion.cpp`.
2. Compile: `g++ -std=c++17 recursion.cpp -o recursion`.
3. Run: `./recursion`.
4. Observe the output: `Factorial of 4 is: 24`.

---

## Concept Unit: Inspecting the Call Stack

### The Problem
To truly understand recursion, you must prove that each invocation of the function is distinct and does not overwrite the variables of the previous invocation. If `n` is just a variable, how can the program remember that `n` was `4` after `factorial(3)` finishes? You need to inspect memory addresses to verify the call stack exists.

### The New Code
```cpp
#include <iostream>

void probe_stack(int n) {
    if (n == 0) {
        return;
    }
    std::cout << "n = " << n << " is at memory address: " << &n << "\n";
    probe_stack(n - 1);
}

int main() {
    probe_stack(3);
    return 0;
}
```

### Mechanical Walkthrough
- `void probe_stack(int n)`: A recursive function that returns nothing.
- `if (n == 0) return;`: The base case, which simply exits.
- `&n`: The address-of operator. This yields the raw memory address where the current invocation's copy of `n` is stored.
- `std::cout << ...`: Prints the current value of `n` alongside its exact memory location.
- `probe_stack(n - 1);`: The recursive call, moving toward the base case.

### CS Lens
This proves the existence of the **Call Stack**. When a program runs, it allocates a stack data structure in memory. Every time a function is called, a new block of memory called a "stack frame" is pushed onto this stack. This frame holds the function's arguments (like `n`), local variables, and the instruction pointer of where to return. Because each call gets a completely separate stack frame, `n=3` and `n=2` exist simultaneously at different memory addresses.

### SE Lens
The alternative not chosen is storing `n` as a global variable. The tradeoff is state corruption. If recursion relied on a single global variable, calling the function again would destroy the previous state, making it impossible to resume execution correctly. The call stack isolates state automatically, making functions thread-safe and re-entrant.

### Run It Yourself
1. Save the code in `call_stack.cpp`.
2. Compile: `g++ -std=c++17 call_stack.cpp -o call_stack`.
3. Run: `./call_stack`.
4. Observe the output. You will see three distinct memory addresses, and they will likely be sequentially decreasing, proving that the stack grows downward in memory:
   ```
   n = 3 is at memory address: 0x7ffee1b79a8c
   n = 2 is at memory address: 0x7ffee1b79a6c
   n = 1 is at memory address: 0x7ffee1b79a4c
   ```

---

## Concept Unit: Stack Overflow

### The Problem
The call stack is not infinite. The operating system allocates a strict, fixed amount of memory (typically 1MB to 8MB) for a program's stack. If a recursive function fails to hit its base case, it will continuously allocate new stack frames until this memory limit is breached. You need to see exactly how a recursive failure crashes a program.

### The New Code
```cpp
#include <iostream>

void infinite_recursion(int count) {
    if (count % 10000 == 0) {
        std::cout << "Call depth: " << count << "\n";
    }
    // BUG: Missing base case. We never stop.
    infinite_recursion(count + 1);
}

int main() {
    infinite_recursion(1);
    return 0;
}
```

### Mechanical Walkthrough
- `void infinite_recursion(int count)`: A function that tracks how many times it has been called.
- `if (count % 10000 == 0)`: The modulo operator checks if the current count is a multiple of 10,000. 
- `std::cout << ...`: Prints the depth periodically so we can watch the program execute before it dies, rather than printing every single step which would slow the program down too much via I/O.
- `infinite_recursion(count + 1);`: The recursive call that strictly increments. Because there is no `if` statement stopping this when `count` reaches a limit, it will run forever.

### CS Lens
This is a **Stack Overflow**. Every call pushes a new frame. Memory is strictly finite. When the stack pointer crosses the boundary of memory the OS allocated for the stack, the hardware's memory protection unit intercepts it, triggers a segmentation fault, and the OS brutally terminates the process.

### SE Lens
The alternative not chosen is dynamically allocating memory on the heap using `new` for function calls instead of the stack. The tradeoff is speed. The stack is incredibly fast because allocating a frame just involves subtracting a number from a CPU register. Heap allocation requires searching for free memory blocks and acquiring locks, which would make function calls unacceptably slow. C++ accepts the risk of stack overflow in exchange for sheer execution speed.

### Run It Yourself
1. Save the code in `overflow.cpp`.
2. Compile: `g++ -std=c++17 overflow.cpp -o overflow`.
3. Run: `./overflow`.
4. Observe the output. The program will print thousands of lines and then violently crash with a `Segmentation fault` or `Stack overflow` error message:
   ```
   Call depth: 10000
   Call depth: 20000
   Call depth: 30000
   Call depth: 40000
   Segmentation fault (core dumped)
   ```

---

## Concept Unit: Tail Recursion

### The Problem
Some algorithms require deep recursion that naturally exceeds the stack limit, but they do not actually need to "resume" the previous state. If the recursive call is the absolute last thing a function does, keeping the old stack frame around just to immediately return its result is a waste of memory. You need a way to tell the compiler to reuse the current stack frame.

### The New Code
```cpp
#include <iostream>

int tail_factorial(int n, int accumulator) {
    if (n <= 1) {
        return accumulator;
    }
    // The recursive call is the VERY LAST operation.
    // No multiplication happens after the call returns.
    return tail_factorial(n - 1, n * accumulator);
}

int main() {
    int result = tail_factorial(4, 1);
    std::cout << "Tail Factorial of 4 is: " << result << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `int tail_factorial(int n, int accumulator)`: An updated function that takes a second parameter. This `accumulator` carries the running total forward.
- `if (n <= 1) return accumulator;`: The base case now returns the accumulated result rather than a hardcoded `1`.
- `n * accumulator`: The multiplication happens *before* the recursive call, passing the new state forward as an argument.
- `return tail_factorial(n - 1, n * accumulator);`: The **recursive case**. Unlike the first concept unit (`return n * factorial(n-1);`), there is no work left to do when this call finishes. The return value is passed back directly.
- `tail_factorial(4, 1)`: The initial call, seeding the accumulator with `1`.

### CS Lens
This is **Tail Recursion**. Because the current function does absolutely no work after the recursive call, the compiler recognizes that the current stack frame is obsolete. Under `O2` or `O3` optimization levels, the compiler rewrites the recursion into a standard assembly loop (`jmp` instruction), reusing the exact same stack frame over and over. This completely eliminates the risk of a stack overflow.

### SE Lens
The alternative not chosen is sticking with standard recursion and hoping the stack limit is never hit. The tradeoff is correctness for large data sets. By restructuring an algorithm to be tail-recursive, you decouple it from hardware memory limits. However, C++ does not strictly guarantee tail-call optimization like functional languages do; it only happens if optimizations are turned on.

### Run It Yourself
1. Save the code in `tail.cpp`.
2. Compile: `g++ -std=c++17 tail.cpp -o tail`.
3. Run: `./tail`.
4. Observe the output: `Tail Factorial of 4 is: 24`.

---

## Concept Unit: When Iteration is the Better Tool

### The Problem
Recursion is elegant, but function calls have overhead. Pushing stack frames, copying arguments, and jumping execution paths takes CPU cycles. A naive recursive implementation can sometimes perform redundant work, resulting in catastrophic performance degradation. You need to know when to write a raw loop instead.

### The New Code
```cpp
#include <iostream>

// Extremely slow recursive approach
int fib_recursive(int n) {
    if (n <= 1) return n;
    return fib_recursive(n - 1) + fib_recursive(n - 2);
}

// Fast iterative approach
int fib_iterative(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1, current = 0;
    
    for (int i = 2; i <= n; ++i) {
        current = a + b;
        a = b;
        b = current;
    }
    return current;
}

int main() {
    std::cout << "Iterative: " << fib_iterative(40) << "\n";
    // recursive(40) would take noticeably longer to execute
    std::cout << "Recursive: " << fib_recursive(40) << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `fib_recursive`: Implements the Fibonacci sequence naturally. `F(n) = F(n-1) + F(n-2)`.
- `fib_recursive(n - 1) + fib_recursive(n - 2)`: The recursive case splits into two entirely separate execution branches.
- `fib_iterative`: The exact same mathematical logic translated into state variables.
- `int a = 0, b = 1, current = 0;`: Manually tracks the previous two values.
- `for (int i = 2; i <= n; ++i)`: A standard loop pushing the state forward sequentially without invoking new functions.

1. `fib_recursive(5)` calls `fib_recursive(4)` and `fib_recursive(3)`.
2. `fib_recursive(4)` calls `fib_recursive(3)` and `fib_recursive(2)`.
3. Notice that `fib_recursive(3)` is now calculated twice from scratch.
4. As `n` grows, the number of redundant calculations explodes exponentially ($O(2^N)$).

### CS Lens
This demonstrates time complexity dominance. The recursive Fibonacci has a time complexity of $O(2^N)$ because the execution tree doubles at every step. The iterative version has a time complexity of $O(N)$ because it visits each number exactly once. Elegance in code does not override algorithmic complexity.

### SE Lens
The alternative not chosen is using recursion but adding a caching layer ("memoization") to store results. The tradeoff is implementation complexity and memory. Iteration here uses exactly three integers of memory and is lightning fast. While recursion is strictly necessary for traversing unknown branching structures like directories or binary trees, for linear or easily predictable state sequences, a standard `for` loop is professionally superior.

### Run It Yourself
1. Save the code in `fibonacci.cpp`.
2. Compile: `g++ -std=c++17 fibonacci.cpp -o fibonacci`.
3. Run: `./fibonacci`.
4. Observe the output. The iterative result appears instantly. The recursive result will visibly pause the program for a few seconds as the CPU performs hundreds of millions of redundant calculations.

---

## Connect the Pieces

You have traced a value through its lifecycle: moving from a raw recursive call `factorial(4)`, observing how the C++ compiler maps that directly to the OS call stack via memory addresses, watching that stack intentionally shatter via stack overflow, fixing it with an accumulator to enable tail recursion, and finally recognizing that for simple sequences, a standard loop `fib_iterative` bypasses all this complexity entirely. The call stack is not an abstract concept; it is physical memory governed by strict rules. 

## What Breaks Without This

If you ignore the base case in a recursive function, the compiler cannot save you. The program will successfully compile, run, silently consume all its allocated memory, and terminate abruptly. The hardware will shut the process down to prevent it from crashing the host operating system.

## Exercises

1. **Sum of Array:** Write a recursive function that takes an `int[]` array, its size `n`, and returns the sum of its elements. The base case should be `n == 0` returning `0`.
2. **Reverse Output:** Write a recursive countdown that takes `n=3`, but place the `std::cout << n` *after* the recursive call `countdown(n-1)`. Run it and explain why it prints `1 2 3` instead of `3 2 1`.
3. **Directory Search:** (Mental exercise) Explain out loud why writing a loop to find a file inside nested folders of unknown depth is exceptionally difficult without using recursion or manually maintaining an `std::vector` as a stack.

## Definition of Done

- [ ] You have compiled and run a standard recursive function.
- [ ] You have observed the call stack memory addresses changing.
- [ ] You have explicitly caused and witnessed a stack overflow.
- [ ] You have implemented tail recursion using an accumulator parameter.
- [ ] You can explain out loud why iterative Fibonacci is faster than naive recursive Fibonacci.
