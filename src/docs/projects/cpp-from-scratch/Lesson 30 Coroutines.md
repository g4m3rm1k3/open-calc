# Lesson 30: Coroutines

**What you will build**
You will build a custom lazy generator and an awaitable task type. This proves that C++ functions can suspend their execution, yield control back to the caller, and resume later, solving the problem of holding state across multiple invocations without writing full class-based state machines.

**What you need to know first**
Lesson 29 (Futures and Async), Lesson 18 (Lambda Expressions).

**Terms used in this lesson**
- **Coroutine** — a function that can suspend execution to be resumed later. *Why it exists:* It allows writing asynchronous or stateful-sequence code that looks like a normal synchronous function, avoiding complex state machines or callback hell.
- **Coroutine frame** — a heap-allocated block of memory that holds a suspended coroutine's local variables, arguments, and execution state. *Why it exists:* When a normal function returns, its stack is destroyed. A coroutine needs its state to survive suspension so it can pick up exactly where it left off.
- **Promise type** — the struct inside a coroutine's return type that dictates how the coroutine behaves (how it starts, yields, returns, and handles exceptions). *Why it exists:* C++ does not hardcode coroutine behavior into the language; it delegates it to this type so developers can build lazy generators, eager tasks, or event loops as needed.

**Objects and methods used**
- **`std::coroutine_handle`**
  - *What it is:* A non-owning pointer to a suspended coroutine frame.
  - *Implementation:* `template<typename Promise> struct coroutine_handle;`
  - *Its use:* Giving the caller the ability to resume (`.resume()`) or destroy (`.destroy()`) the suspended coroutine.
- **`std::suspend_always`**
  - *What it is:* A trivial awaitable object that always dictates the coroutine should suspend.
  - *Implementation:* `struct suspend_always { constexpr bool await_ready() const noexcept { return false; } /*...*/ };`
  - *Its use:* Used in promise types to pause the coroutine immediately at startup or yield.
- **`std::suspend_never`**
  - *What it is:* A trivial awaitable object that dictates the coroutine should *not* suspend.
  - *Implementation:* `struct suspend_never { constexpr bool await_ready() const noexcept { return true; } /*...*/ };`
  - *Its use:* Used when a coroutine should start eagerly or clean up without pausing.

---

## Concept Unit: The Promise Type and `co_return`

### The Problem
C++20 introduced the keywords to suspend functions (`co_await`, `co_yield`, `co_return`), but the standard library (until C++23) provides almost no built-in coroutine return types. To write a coroutine, we must first define a return type containing a nested `promise_type` that tells the compiler how to manage the coroutine frame.

### The New Code
```cpp
#include <iostream>
#include <coroutine>

struct MinimalTask {
    struct promise_type {
        MinimalTask get_return_object() { return MinimalTask{}; }
        std::suspend_never initial_suspend() { return {}; }
        std::suspend_never final_suspend() noexcept { return {}; }
        void return_void() {}
        void unhandled_exception() {}
    };
};

MinimalTask say_hello() {
    std::cout << "Starting coroutine\n";
    co_return;
}

int main() {
    say_hello();
    return 0;
}
```

### The Updated Project
No reference counterpart — this is a from-scratch addition because we are exploring the language feature in isolation before integrating it into a larger system. Compile this directly as `coroutine_demo.cpp`.

```cpp
// ← new file: coroutine_demo.cpp
// Contains the MinimalTask struct and main function shown above.
```

### Mechanical Walkthrough
- `struct promise_type` — the exact name the C++ compiler looks for inside a coroutine's return type. This object sits inside the heap-allocated coroutine frame and controls the lifecycle.
- `MinimalTask get_return_object()` — called by the compiler when the coroutine frame is first created. It builds the object that is returned to the caller (`main`).
- `std::suspend_never initial_suspend()` — called immediately after the frame is created. Returning `suspend_never` means the coroutine starts running immediately, like a normal function.
- `std::suspend_never final_suspend() noexcept` — called when the coroutine finishes. Returning `suspend_never` means the frame destroys itself automatically when done.
- `void return_void()` — called when the coroutine executes `co_return;` or falls off the end. It handles the void return.
- `void unhandled_exception()` — called if an exception escapes the coroutine body. Required by the compiler to prevent undefined behavior on unwinding.
- `co_return;` — a new language keyword. Using it forces `say_hello` to be compiled as a coroutine rather than a regular function. It maps to `promise_type::return_void()`.

### CS Lens
This is **State Machine Generation**. The compiler rewrites the body of `say_hello` into a state machine. The `promise_type` acts as the configuration interface for that compiler-generated state machine. Also recognized in: parser generators, async/await in C# or JavaScript, and Python generator functions.

### SE Lens
The alternative not chosen is baking a specific `Task` type into the compiler (like C# does). By forcing developers to provide `promise_type`, C++ allows coroutines to be highly optimized for zero-allocation or custom scheduling. The tradeoff is intense boilerplate for simple use cases, requiring library authors to write wrappers before application developers can use the feature easily.

### Commands Needed
To compile C++20 code:
`g++ -std=c++20 coroutine_demo.cpp -o coroutine_demo`
(Uses the `-std=c++20` flag to enable coroutine support).

### Run It
```
Starting coroutine
```
This proves the coroutine runs, but because it never actually suspends, it behaves exactly like a normal function.

Connecting this unit: To actually pause execution, we need to introduce handles and `co_await`.

---

## Concept Unit: Pausing and Resuming with `co_await`

### The Problem
We want a function to do some work, pause, return control to `main`, and let `main` resume it later. To do this, we need a way to hold onto the coroutine frame and manually drive its execution.

### The New Code
```cpp
#include <iostream>
#include <coroutine>

struct Resumable {
    struct promise_type {
        Resumable get_return_object() {
            return Resumable{std::coroutine_handle<promise_type>::from_promise(*this)};
        }
        std::suspend_always initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; }
        void return_void() {}
        void unhandled_exception() {}
    };

    std::coroutine_handle<promise_type> handle;
    
    ~Resumable() {
        if (handle) handle.destroy();
    }
};

Resumable pausable_func() {
    std::cout << "  Coroutine: Step 1\n";
    co_await std::suspend_always{};
    std::cout << "  Coroutine: Step 2\n";
}
```

### The Updated Project
Replace the `MinimalTask` from the previous step with `Resumable`.
```cpp
int main() {
    std::cout << "Main: Calling coroutine\n";
    Resumable task = pausable_func(); // ← new usage
    
    std::cout << "Main: Resuming\n";
    task.handle.resume();             // ← new usage
    
    std::cout << "Main: Resuming again\n";
    task.handle.resume();             // ← new usage
    
    std::cout << "Main: Done\n";
    return 0;
}
```

### Mechanical Walkthrough
- `std::coroutine_handle<promise_type>::from_promise(*this)` — creates a handle pointing to the current coroutine frame. This is the key we give to the caller.
- `std::suspend_always initial_suspend()` — dictates that the coroutine should pause *before* running its first line of code. The caller receives the `Resumable` object immediately without the coroutine printing anything yet.
- `std::suspend_always final_suspend() noexcept` — pauses the frame at the very end instead of destroying itself. This keeps the handle valid so we can interrogate it later.
- `~Resumable()` — the caller now owns the frame via the handle. Because the frame no longer self-destructs, the `Resumable` destructor must call `handle.destroy()` to free the heap memory and prevent leaks.
- `co_await std::suspend_always{};` — suspends the coroutine mid-execution. Control jumps back to whoever last called `resume()`.
- `task.handle.resume()` — jumps into the coroutine frame, continuing execution from wherever it was last suspended (either the initial suspend, or the `co_await`), until it suspends again.

1. `pausable_func()` — creates the frame, hits `initial_suspend`, and pauses before printing anything. Returns the `Resumable` handle.
2. `task.handle.resume()` — enters the coroutine. Prints "Step 1".
3. `co_await std::suspend_always{}` — pauses the coroutine. Control returns to `main`.
4. `task.handle.resume()` — re-enters the coroutine. Prints "Step 2". Hits the end, calls `return_void`, then `final_suspend` (pausing again). Control returns to `main`.
5. `~Resumable()` — destroys the frame memory when `task` goes out of scope.

### CS Lens
This is **Cooperative Multitasking**. Unlike OS threads which are preemptively swapped by a scheduler out of your control, coroutines yield control voluntarily and explicitly at `co_await` boundaries.

### SE Lens
The alternative to explicit handle destruction is garbage collection. In C++, because a suspended coroutine lives on the heap, someone must own it. Tying `coroutine_handle::destroy` to an RAII destructor (`~Resumable`) ensures the frame doesn't leak while still preserving deterministic memory management.

### Run It
```
Main: Calling coroutine
Main: Resuming
  Coroutine: Step 1
Main: Resuming again
  Coroutine: Step 2
Main: Done
```

Connecting this unit: Suspending is useful, but we often want to pass data back to the caller when suspending.

---

## Concept Unit: Generating Values with `co_yield`

### The Problem
A common use case for coroutines is lazy generation: computing a sequence of values one at a time, pausing after each value is produced, and resuming only when the caller asks for the next one.

### The New Code
```cpp
#include <iostream>
#include <coroutine>

struct Generator {
    struct promise_type {
        int current_value;
        
        Generator get_return_object() {
            return Generator{std::coroutine_handle<promise_type>::from_promise(*this)};
        }
        std::suspend_always initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; }
        void return_void() {}
        void unhandled_exception() {}
        
        std::suspend_always yield_value(int value) {
            current_value = value;
            return {};
        }
    };

    std::coroutine_handle<promise_type> handle;
    ~Generator() { if (handle) handle.destroy(); }
};

Generator generate_numbers() {
    for (int i = 1; i <= 3; ++i) {
        co_yield i * 10;
    }
}
```

### The Updated Project
Replace the `main` function to consume the generator.
```cpp
int main() {
    Generator gen = generate_numbers();
    while (true) {
        gen.handle.resume();
        if (gen.handle.done()) break; // ← new usage
        std::cout << "Got: " << gen.handle.promise().current_value << "\n"; // ← new usage
    }
    return 0;
}
```

### Mechanical Walkthrough
- `int current_value` — state added to the promise type to shuttle data from the coroutine to the caller.
- `std::suspend_always yield_value(int value)` — maps directly to the `co_yield` keyword. It saves the value into the promise and then suspends the coroutine, yielding control to the caller.
- `co_yield i * 10;` — evaluates the expression, passes it to `promise_type::yield_value`, and pauses execution.
- `gen.handle.done()` — checks if the coroutine is currently suspended at its `final_suspend` point, meaning no more values will be produced.
- `gen.handle.promise()` — gives the caller access to the `promise_type` instance residing inside the coroutine frame, allowing us to read `current_value`.

Iteration 1: `resume` runs loop to `co_yield 10`, calls `yield_value`, sets `current_value` = 10, pauses. Main prints 10.
Iteration 2: `resume` loops back around, hits `co_yield 20`, sets `current_value` = 20, pauses. Main prints 20.
Iteration 3: `resume` loops back around, hits `co_yield 30`, sets `current_value` = 30, pauses. Main prints 30.
Iteration 4: `resume` finishes loop, hits end of function, `done()` becomes true. Main breaks out.

### CS Lens
This is **Lazy Evaluation**. The sequence elements are computed just-in-time, exactly when requested, rather than allocating a vector and computing all values upfront. Also recognized in: Haskell's entire evaluation model, database cursors, stream processing.

### SE Lens
The alternative is writing an iterator class with a state machine manually (storing loop index `i` as a class member, checking it inside `operator++`). Coroutines let the compiler generate that state machine from a standard `for` loop, drastically reducing boilerplate for complex traversal logic.

### Run It
```
Got: 10
Got: 20
Got: 30
```

---

## Connect the Pieces
A coroutine starts by allocating a coroutine frame and instantiating the `promise_type` within it. It yields a `coroutine_handle` to the caller, allowing the caller to explicitly `.resume()` the suspended execution. As the coroutine runs, it can use `co_yield` to stash a value in the promise and suspend, or `co_await` to pause on an asynchronous operation. The caller checks `.done()` to know when the coroutine has hit `co_return`, and finally, an RAII destructor calls `.destroy()` to free the frame.

## What Breaks Without This
If you forget to implement `~Generator() { handle.destroy(); }` or rely on `suspend_never` for `final_suspend` while still holding a handle, memory leaks or undefined behavior occur.

Remove the destructor from `Generator`:
```cpp
// ~Generator() { if (handle) handle.destroy(); }
```
When compiled and run under a memory sanitizer or valgrind, you will see a definite memory leak because the heap-allocated coroutine frame was never freed.

## Exercises
1. Modify the `Generator` example to yield an infinite sequence of Fibonacci numbers using an infinite `while (true)` loop. Have `main` resume and print only the first 10.
2. Change `initial_suspend` in `Generator::promise_type` to return `std::suspend_never` and observe how the first value is produced before `generate_numbers()` even returns to `main`.

## Definition of Done
- [ ] You can explain what a coroutine frame is and where it lives.
- [ ] You can describe the role of `promise_type` in configuring coroutine behavior.
- [ ] You understand the difference between `co_await` (pausing) and `co_yield` (pausing and producing a value).
- [ ] You can write a small lazy generator from scratch.
- [ ] You understand why `coroutine_handle::destroy` is necessary when using `suspend_always` at `final_suspend`.
