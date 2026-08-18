# Lesson 29: Futures and Async

**What you will build:** You will build small, isolated examples that run code asynchronously and retrieve the result later. This proves you can offload work without manually spawning and joining threads or passing data back through a shared, mutex-locked variable.
**What you need to know first:** Lesson 27 Threads and Mutex, Lesson 28 std::atomic.

**Terms used in this lesson:**
- **Future** — a read-only placeholder object that will eventually hold a value computed on another thread. *Why it exists:* It gives the caller a safe way to ask "is the result ready yet?" or wait for it, without needing to lock a shared variable or manage a condition variable manually.
- **Promise** — a write-only channel used by a worker to supply a value to a corresponding future. *Why it exists:* It decouples the act of producing a result from the act of consuming it, allowing one thread to "promise" a result that another thread holds a future for.
- **Async** — a high-level function that runs a task (often on a background thread) and immediately returns a future for its result. *Why it exists:* It abstracts away thread creation and promise/future wiring, turning asynchronous execution into a single function call.

**Objects and methods used:**
- **std::async**
  - *What it is:* A template function that executes a callable asynchronously.
  - *Implementation:* `template< class Function, class... Args > std::future<std::invoke_result_t<std::decay_t<Function>, std::decay_t<Args>...>> async( std::launch policy, Function&& f, Args&&... args );`
  - *Its use:* Launching a task without manually creating a `std::thread`.
- **std::future / get**
  - *What it is:* A class template that provides access to the result of an asynchronous operation. `get()` retrieves the value.
  - *Implementation:* `T std::future<T>::get();`
  - *Its use:* Blocking the current thread until the async work finishes, then returning the computed value.
- **std::promise / set_value**
  - *What it is:* A facility to store a value or an exception that is later acquired asynchronously via a `std::future` created by the `promise` object.
  - *Implementation:* `void std::promise<T>::set_value( const T& value );`
  - *Its use:* Manually fulfilling a future from a thread you control.
- **std::packaged_task**
  - *What it is:* A wrapper that wraps any callable target so that it can be invoked asynchronously, storing its return value in a shared state accessible through a `std::future`.
  - *Implementation:* `template< class R, class... Args > class packaged_task<R(Args...)>;`
  - *Its use:* Preparing a function to be executed later (e.g., pushed to a thread pool's task queue) while immediately getting a future for it.

---

## Concept Unit: Returning Values from Threads

### The Problem
In Lesson 27, when a `std::thread` computed a result, the only way to get that result back to the main thread was to pass a reference to a shared variable and protect it with a `std::mutex`. This requires writing thread-safe synchronization code just to answer the simple question, "what did the function return?"

### The New Code
```cpp
#include <iostream>
#include <future>
#include <thread>
#include <chrono>

int calculate_answer() {
    std::cout << "Worker: Calculating..." << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(2));
    return 42;
}

int main() {
    std::cout << "Main: Starting async task..." << std::endl;
    
    std::future<int> result = std::async(std::launch::async, calculate_answer);
    
    std::cout << "Main: Doing other work..." << std::endl;
    
    int answer = result.get();
    
    std::cout << "Main: The answer is " << answer << std::endl;
    return 0;
}
```

### Discard the Throwaway Example
This is a standalone, isolated example to prove `std::async` works. We will not keep this code for a broader project.

### Mechanical Walkthrough
- `std::async(std::launch::async, calculate_answer)` launches the `calculate_answer` function. The `std::launch::async` policy forces it to run on a new, separate thread immediately. If the policy were omitted, the C++ runtime could decide to defer execution.
- `std::future<int> result = ...` captures the return value of `std::async`. `std::future<int>` is a handle to an integer that does not exist yet. It represents the eventual return value of `calculate_answer`.
- `result.get()` asks the future for the value. Because the worker thread is sleeping for 2 seconds, the result is not ready. `get()` blocks the main thread, waiting until the worker returns 42. Once `get()` returns, the future is consumed and cannot be asked for the value again.

### CS Lens
This is the Actor model's concept of a "promise" or "future" applied to shared-memory concurrency. Instead of sharing mutable state (a shared variable and a mutex), you share an immutable channel: the future. The worker thread owns the write side, and the main thread owns the read side.

### SE Lens
The alternative not chosen is using a `std::thread` holding a reference to an atomic variable or a mutex-guarded integer. That alternative costs boilerplate and is easy to get wrong (e.g., reading the variable before the thread joins). `std::async` costs a small overhead for the hidden shared state allocated by the standard library, but guarantees the data is synchronized and safely transferred to the caller without explicit locking.

### Run It Yourself
1. Save the code as `async.cpp`.
2. Compile it: `g++ -std=c++17 -pthread async.cpp -o async_demo`
3. Run it: `./async_demo`
4. Observe the output. You will see "Main: Doing other work..." print immediately, followed by a 2-second pause before "Main: The answer is 42".

---

## Concept Unit: Fulfilling a Future Manually

### The Problem
`std::async` is convenient, but it hides the thread creation. Sometimes you already have a background thread running (like a dedicated network thread), or you want to provide a value to a future based on an event rather than a function returning. You need a way to manually fulfill a future.

### The New Code
```cpp
#include <iostream>
#include <future>
#include <thread>
#include <chrono>

void network_listener(std::promise<std::string> prom) {
    std::cout << "Thread: Listening for data..." << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(1));
    std::string fake_data = "packet_received";
    
    std::cout << "Thread: Fulfilling promise!" << std::endl;
    prom.set_value(fake_data);
}

int main() {
    std::promise<std::string> my_promise;
    std::future<std::string> my_future = my_promise.get_future();
    
    std::thread t(network_listener, std::move(my_promise));
    
    std::cout << "Main: Waiting for data..." << std::endl;
    std::string data = my_future.get();
    
    std::cout << "Main: Got data: " << data << std::endl;
    t.join();
    return 0;
}
```

### Discard the Throwaway Example
This file is standalone proof of `std::promise` and will not be retained.

### Mechanical Walkthrough
- `std::promise<std::string> my_promise` creates an empty channel for a string. This is the write side.
- `my_promise.get_future()` extracts the read side. This `std::future<std::string>` is permanently linked to `my_promise`.
- `std::thread t(network_listener, std::move(my_promise))` spawns a raw `std::thread`. Because `std::promise` cannot be copied (you can't have two writers for one future), it must be moved into the thread using `std::move`.
- `prom.set_value(fake_data)` is called inside the worker thread. This pushes the string into the shared state. The moment this runs, the linked future is fulfilled.
- `my_future.get()` blocks the main thread until `set_value` is called, then extracts the string.

### CS Lens
This is the decoupling of execution and synchronization. A promise/future pair acts as a one-shot, single-item pipe. The producer (`promise`) and consumer (`future`) do not need to know anything about each other's execution context, only that they share this pipe.

### SE Lens
The alternative is using a `std::condition_variable`, a `std::mutex`, a boolean `ready` flag, and a string variable. Using `std::promise` eliminates the chance of writing a buggy condition variable loop (such as missing a wakeup or failing to lock the mutex correctly). It trades the tiny overhead of the promise's internal heap allocation for absolute safety and significantly less code.

### Run It Yourself
1. Save the code as `promise.cpp`.
2. Compile it: `g++ -std=c++17 -pthread promise.cpp -o promise_demo`
3. Run it: `./promise_demo`

---

## Concept Unit: Deferring Work with std::packaged_task

### The Problem
If `std::async` runs work immediately, and `std::promise` requires manually setting values, what do you use when you want to queue up functions to be run later (like pushing them to a thread pool), but still want a `std::future` right now so you can ask for the result later?

### The New Code
```cpp
#include <iostream>
#include <future>
#include <cmath>

double compute_heavy(double x) {
    return std::sqrt(x);
}

int main() {
    std::packaged_task<double(double)> task(compute_heavy);
    std::future<double> result = task.get_future();
    
    std::cout << "Main: Task packaged, but not running yet." << std::endl;
    
    task(16.0); 
    
    std::cout << "Main: Task invoked. Result: " << result.get() << std::endl;
    return 0;
}
```

### Discard the Throwaway Example
This snippet is standalone proof of `std::packaged_task` and will be discarded.

### Mechanical Walkthrough
- `std::packaged_task<double(double)> task(compute_heavy)` wraps the `compute_heavy` function. The type `double(double)` specifies the signature: it takes a double and returns a double.
- `task.get_future()` extracts the read side. Just like `std::promise`, a packaged task creates a shared state and gives you the future for it.
- `task(16.0)` actually invokes the wrapped function. When `compute_heavy(16.0)` returns `4.0`, the packaged task catches that return value and automatically calls `set_value(4.0)` on the underlying promise. 
- `result.get()` retrieves the `4.0`. Because the task was already invoked on the previous line (on the main thread, synchronously), `get()` returns immediately without blocking.

### CS Lens
A packaged task is a closure that bridges functional programming and concurrency. It turns an ordinary function return into an asynchronous message, allowing the caller to treat "running the function" and "getting its result" as two completely separate operations that can happen on different threads at different times.

### SE Lens
The alternative is manually writing a lambda that captures a `std::promise` and calls `set_value` with the result of `compute_heavy`. `std::packaged_task` provides this wrapper for you. It is the fundamental building block for thread pools: a thread pool's queue is simply a list of `std::packaged_task`s that worker threads pop and invoke.

### Run It Yourself
1. Save the code as `packaged.cpp`.
2. Compile it: `g++ -std=c++17 -pthread packaged.cpp -o packaged_demo`
3. Run it: `./packaged_demo`

---

## Connect the Pieces
`std::async` is the highest-level tool: it takes a function, starts a thread, and returns a `std::future`. Underneath the hood, `std::async` behaves as if it creates a `std::packaged_task` to wrap your function, extracts the `std::future`, and passes the task to a `std::thread`. The `std::packaged_task` itself is built on top of `std::promise`: when invoked, it runs your function and calls `set_value` on an internal `std::promise`, which fulfills the `std::future` held by the caller.

## What Breaks Without This
If you try to call `get()` on a future more than once, the program will crash because the future's shared state is consumed on the first read.

Modify the `async.cpp` example to add a second `get()`:
```cpp
    int answer = result.get();
    int answer2 = result.get(); // Breaks here
```
When compiled and run, the program will terminate with `std::future_error`: "Future already retrieved."

Restore the code by removing the second `get()`, or by using `std::shared_future` if multiple threads genuinely need to read the same result.

## Exercises
1. Modify `async.cpp` to use `std::launch::deferred` instead of `std::launch::async`. Add a print statement before `result.get()`. Observe that the worker thread's printing now happens *after* the main thread waits, because deferred execution runs the function synchronously exactly when `get()` is called.
2. Modify `promise.cpp` to create a `std::promise<void>` and `std::future<void>`. Use this to implement a pure signal (e.g., the worker waits until the main thread calls `prom.set_value()`, acting as a start gun).

## Definition of Done
- [ ] You can explain why `std::future` replaces a mutex-protected shared variable for returning results.
- [ ] You understand that `std::async` automatically spawns execution, while `std::promise` requires you to provide the value yourself.
- [ ] You know that `std::packaged_task` wraps a function so it can be passed around and invoked later.
- [ ] You can safely retrieve a value from a future using `.get()`.
