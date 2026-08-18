# Lesson 05: The Observer Pattern

What you will build
You will build a decoupled event notification system where a central subject (a sensor) broadcasts its state changes to multiple independent listeners (displays), without the subject needing to know what those listeners are or how long they live. The core transferable problem is decoupling: how to let an arbitrary number of components react to an event without hardcoding them into the event source, and how to do it safely when listeners might be destroyed before the source is.

What you need to know first
- C++ From Scratch: Lambdas (`[captures](params) { body }`), `std::function`, `std::vector`, smart pointers (`std::shared_ptr`, `std::weak_ptr`).

Terms used in this lesson
- **Observer Pattern** — a behavioral design pattern where an object (the subject) maintains a list of its dependents (observers) and notifies them automatically of any state changes, usually by calling one of their methods. It exists to break tight coupling, allowing the subject and observers to evolve independently.
- **Subject** — the entity that holds state and broadcasts changes. It exists to be the single source of truth that others listen to, rather than having others constantly poll it.
- **Observer** — the entity that listens for changes from a Subject. It exists to react to state changes without being permanently hardcoded into the Subject's internal logic.
- **Dangling Pointer/Reference** — a pointer or reference that points to a memory location that has been deleted or deallocated. It exists as a constant hazard in systems where objects outlive the things pointing to them, leading to undefined behavior (UB).
- **Undefined Behavior (UB)** — a situation where the C++ standard provides no guarantees about what the program will do. It exists as a consequence of C++ trusting the programmer to manage memory and lifetimes correctly in exchange for performance.

Objects and methods used
- **`std::function`**
  - *What it is:* a general-purpose polymorphic function wrapper.
  - *Implementation:* `std::function<void(int)>` (a type that can hold any callable taking an `int` and returning `void`).
  - *Its use:* storing heterogeneous callbacks (free functions, member functions, lambdas) in a single collection inside the Subject.
- **`std::vector`**
  - *What it is:* a sequence container that encapsulates dynamic size arrays.
  - *Implementation:* `std::vector<std::function<void(int)>>`.
  - *Its use:* holding the list of registered observer callbacks so the Subject can iterate through them.
- **`std::weak_ptr`**
  - *What it is:* a smart pointer that holds a non-owning ("weak") reference to an object that is managed by `std::shared_ptr`.
  - *Implementation:* `std::weak_ptr<T>`.
  - *Its use:* breaking reference cycles and allowing observers to be safely checked for existence before calling them, solving the dangling observer problem.
- **`std::enable_shared_from_this`**
  - *What it is:* a base class template that allows an object to create a `std::shared_ptr` to itself.
  - *Implementation:* `class Display : public std::enable_shared_from_this<Display>`.
  - *Its use:* safely generating a `std::weak_ptr` from `this` inside a class method without accidentally creating a second independent control block for the same object.

## Concept Unit: The Observer Pattern and Callback Registration

### The Problem
A system has a core state-holding object, like a temperature sensor. Multiple other components, like a UI display, a logger, and an alarm system, need to know when the temperature changes. Hardcoding calls to `display.update()`, `logger.log()`, and `alarm.check()` inside the sensor's `setTemperature` method tightly couples the sensor to those specific classes. Every new listener requires modifying the sensor's code, recompiling it, and making it depend on the new listener's header. The sensor should not know or care who is listening.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the pattern.
- **Files affected:** `main.cpp` (created).
- **Change type:** add.
- **Location:** freestanding new file.
- **Dependencies:** none.

### The New Code

```cpp
#include <iostream>
#include <vector>
#include <functional>

class Sensor {
public:
    using Observer = std::function<void(int)>;

    void subscribe(Observer obs) {
        observers.push_back(std::move(obs));
    }

    void setTemperature(int temp) {
        temperature = temp;
        notify();
    }

private:
    void notify() {
        for (const auto& obs : observers) {
            obs(temperature);
        }
    }

    int temperature = 0;
    std::vector<Observer> observers;
};
```

### The Updated Project
Skip since this is a brand-new file and the code above is the entire structure.

### Introduce the concept in isolation
We will use a lambda and `std::function` to represent a callback that can be executed later. This is exactly what `Sensor` in the code above is doing, isolated.

```cpp
#include <iostream>
#include <functional>
#include <vector>

int main() {
    std::vector<std::function<void(int)>> callbacks;
    
    // Registering a callback
    callbacks.push_back([](int val) {
        std::cout << "Callback A received: " << val << "\n";
    });
    
    // Registering another callback
    callbacks.push_back([](int val) {
        std::cout << "Callback B received: " << val << "\n";
    });
    
    // The subject broadcasting an event
    int new_value = 42;
    for (const auto& cb : callbacks) {
        cb(new_value);
    }
    
    return 0;
}
```

Output:
```
Callback A received: 42
Callback B received: 42
```
This output proves that a collection can hold multiple independent pieces of code and execute them sequentially with the same input, which is called the **Observer Pattern**. The broadcaster loops over `std::function` objects without knowing what the callbacks actually do.

### Discard the throwaway example
The isolated code above is deleted and will not appear in the project.

### Mechanical walkthrough

- `#include <iostream>` — includes the standard I/O library.
- `#include <vector>` — includes the standard vector container.
- `#include <functional>` — includes the library containing `std::function`.
- `class Sensor { ... };` — defines the Subject class that will broadcast events.
- `public:` — access modifier exposing the interface.
- `using Observer = std::function<void(int)>;` — creates a type alias `Observer` for any callable taking an `int` (the new temperature) and returning `void`. It exists to make the rest of the class definition more readable.
- `void subscribe(Observer obs) { ... }` — the method listeners call to register themselves. It takes an `Observer` callback by value.
- `observers.push_back(std::move(obs));` — adds the callback to the end of the `std::vector`. It uses `std::move` to avoid copying the `std::function` object, transferring ownership directly into the vector for efficiency.
- `void setTemperature(int temp) { ... }` — the state-mutating method.
- `temperature = temp;` — updates the internal state.
- `notify();` — triggers the broadcast immediately after the state changes.
- `private:` — access modifier protecting internal state and helpers.
- `void notify() { ... }` — the private helper method that actually performs the broadcast.
- `for (const auto& obs : observers) { ... }` — iterates over every registered callback in the vector. It iterates by `const auto&` to avoid copying each `std::function` object.
- `obs(temperature);` — executes the callback, passing the current `temperature`. This is the core mechanism of the **Observer Pattern** — the subject invoking the listener's code.
- `int temperature = 0;` — the state being observed, initialized to 0.
- `std::vector<Observer> observers;` — the dynamic array holding all registered callbacks.

### CS Lens
The core computational concept here is **Inversion of Control (IoC)**. Instead of the listeners actively polling the sensor for its temperature (which wastes CPU cycles and introduces latency), the sensor pushes the update to the listeners only when something changes.
Also recognized in: UI event loops (button clicks), network socket readiness events (epoll/kqueue), pub/sub messaging queues (Kafka, RabbitMQ), hardware interrupts.

### SE Lens
The design principle at work is **Loose Coupling**. The alternative not chosen was having `Sensor` hold specific pointers like `Display*` and `Logger*` and call `display->update(temp)`. That alternative forces the `Sensor` class to be modified every time a new type of listener is added, violating the Open/Closed Principle. By using `std::function`, the `Sensor` depends only on the *signature* of the callback (`void(int)`), not on the specific types or identities of the listeners. The maintenance cost of this approach is that the subject now holds opaque callbacks; debugging a misbehaving listener requires tracing through the generic `std::function` invocation, which can obscure the control flow.

### Commands needed
```bash
g++ -std=c++17 main.cpp -o observer
```
- `g++` — the GNU C++ compiler.
- `-std=c++17` — tells the compiler to use the C++17 standard.
- `main.cpp` — the source file to compile.
- `-o observer` — names the output executable `observer`.

### Run it.
Cannot run standalone yet; the `Sensor` needs listeners to subscribe to it, and a `main` function is missing.

### One sentence connecting this unit to what came immediately before.
With the subject capable of broadcasting to generic callbacks, we must now examine what happens when those callbacks belong to objects that might not exist forever.

## Concept Unit: The Dangling Observer Problem and `std::weak_ptr`

### The Problem
When a listener registers a callback (often a lambda capturing a pointer to itself, like `[this](int t) { this->update(t); }`), the `Sensor` stores that lambda in its `std::vector`. If the listener object is destroyed, the `Sensor` still holds the lambda and will eventually call it. The lambda will execute `this->update(t)` on a destroyed object, resulting in a dangling pointer dereference and Undefined Behavior (usually a segmentation fault). The subject needs a way to know if a listener is still alive before calling it.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `main.cpp` (modified).
- **Change type:** add.
- **Location:** appended to the end of the file, after the `Sensor` class.
- **Dependencies:** the `Sensor` class from the previous unit.

### The New Code

```cpp
#include <memory>

class Display : public std::enable_shared_from_this<Display> {
public:
    void update(int temp) {
        std::cout << "Display showing temperature: " << temp << "\n";
    }

    void subscribeTo(Sensor& sensor) {
        std::weak_ptr<Display> weak_self = shared_from_this();
        sensor.subscribe([weak_self](int temp) {
            if (auto shared_self = weak_self.lock()) {
                shared_self->update(temp);
            } else {
                std::cout << "[Dead observer skipped]\n";
            }
        });
    }
};

int main() {
    Sensor sensor;
    
    {
        auto display = std::make_shared<Display>();
        display->subscribeTo(sensor);
        sensor.setTemperature(25);
    } // display is destroyed here
    
    sensor.setTemperature(30); // notify is called again
    
    return 0;
}
```

### The Updated Project
Skip since `Display` and `main` are freestanding functions and classes with nothing surrounding them yet.

### Introduce the concept in isolation
We will use `std::shared_ptr` and `std::weak_ptr` to demonstrate checking an object's lifetime before using it, exactly what `weak_self.lock()` in the code above is doing, isolated.

```cpp
#include <iostream>
#include <memory>

struct Dummy {
    void speak() { std::cout << "Dummy alive!\n"; }
};

int main() {
    std::weak_ptr<Dummy> weak;
    
    {
        std::shared_ptr<Dummy> shared = std::make_shared<Dummy>();
        weak = shared; // weak observes shared
        
        // Attempting to use the weak_ptr while the object is alive
        if (std::shared_ptr<Dummy> locked = weak.lock()) {
            locked->speak();
        } else {
            std::cout << "Dummy is dead.\n";
        }
    } // shared goes out of scope, Dummy is destroyed
    
    // Attempting to use the weak_ptr after the object is destroyed
    if (std::shared_ptr<Dummy> locked = weak.lock()) {
        locked->speak();
    } else {
        std::cout << "Dummy is dead.\n";
    }
    
    return 0;
}
```

Output:
```
Dummy alive!
Dummy is dead.
```
This output proves that a `std::weak_ptr` can safely observe whether an object managed by a `std::shared_ptr` still exists, and upgrading it via `lock()` returns a null pointer if the object has been destroyed. This is called a **weak reference check**.

### Discard the throwaway example
The isolated code above is deleted and will not appear in the project.

### Mechanical walkthrough

- `#include <memory>` — includes the library for smart pointers.
- `class Display : public std::enable_shared_from_this<Display> { ... };` — defines the observer class. It inherits from `std::enable_shared_from_this` to gain the ability to safely generate a `std::weak_ptr` or `std::shared_ptr` to itself from within its own methods.
- `public:` — access modifier exposing the interface.
- `void update(int temp) { ... }` — the method that reacts to the state change.
- `std::cout << "Display showing temperature: " << temp << "\n";` — prints the new temperature to standard output.
- `void subscribeTo(Sensor& sensor) { ... }` — the registration method taking a reference to the `Sensor`.
- `std::weak_ptr<Display> weak_self = shared_from_this();` — creates a non-owning weak pointer to this `Display` instance. `shared_from_this()` is provided by the base class.
- `sensor.subscribe([weak_self](int temp) { ... });` — registers a lambda with the sensor. It captures `weak_self` by value, meaning the lambda holds a weak reference, not a strong one, preventing reference cycles and not artificially keeping the `Display` alive.
- `if (auto shared_self = weak_self.lock()) { ... }` — inside the lambda, attempts to upgrade the weak pointer to a strong pointer. `lock()` returns a valid `std::shared_ptr` if the object is alive, and an empty one if it is dead. The `if` condition evaluates to true if the pointer is valid.
- `shared_self->update(temp);` — if the object is alive, safely calls its `update` method.
- `else { ... }` — if the object is dead.
- `std::cout << "[Dead observer skipped]\n";` — logs that the dead observer was safely handled.
- `int main() { ... }` — the entry point of the program.
- `Sensor sensor;` — creates the subject.
- `{ ... }` — a nested scope to explicitly control the lifetime of the `display` object.
- `auto display = std::make_shared<Display>();` — creates the listener as a dynamically allocated object managed by a `std::shared_ptr`.
- `display->subscribeTo(sensor);` — registers the listener with the sensor.
- `sensor.setTemperature(25);` — triggers a broadcast while the display is alive.
- `} // display is destroyed here` — the `display` shared pointer goes out of scope. Because the sensor's lambda only holds a `weak_ptr`, the `Display` object's reference count hits zero and it is cleanly destroyed.
- `sensor.setTemperature(30);` — triggers a broadcast when the display is dead. The lambda still executes, but `weak.lock()` fails.
- `return 0;` — terminates the program successfully.

### CS Lens
The concept here is **Safe Lifecycle Management**. In languages with garbage collection, a registered callback will keep the listener alive indefinitely (a "memory leak" in managed languages, where the object is unneeded but reachable). In C++, manual lifecycle management forces us to explicit model the relationship: the subject does not *own* the listeners, so it should only hold weak references to them.
Also recognized in: cache eviction policies (holding weak references to cached objects so they can be freed under memory pressure), DOM event listeners in modern web frameworks (auto-unsubscribing on component unmount).

### SE Lens
The design principle at work is **Defensive Programming**. The alternative not chosen was having the `Display` explicitly call `sensor.unsubscribe(this)` in its destructor. That alternative requires the `Sensor` to implement an `unsubscribe` method (which means searching the vector and dealing with concurrent modification if the unsubscription happens during a notification loop) and forces every listener to remember to unsubscribe perfectly. The maintenance cost of this `weak_ptr` approach is that the `Sensor`'s `std::vector` slowly fills up with "dead" lambdas that do nothing when called, potentially causing a performance hit over time. A production system would periodically prune dead callbacks from the list during `notify()`.

### Commands needed
```bash
g++ -std=c++17 main.cpp -o observer
./observer
```
- `./observer` — executes the compiled binary.

### Run it.
```
Display showing temperature: 25
[Dead observer skipped]
```

### One sentence connecting this unit to what came immediately before.
The system now safely handles listeners dying before the broadcaster, creating a robust implementation of the Observer pattern.

## Closing

- **Connect the pieces** —
  1. `main` calls `sensor.setTemperature(30)`.
  2. `Sensor` updates its internal state to 30.
  3. `Sensor` iterates over its vector of `std::function` callbacks.
  4. The first callback executes its lambda.
  5. The lambda attempts to upgrade its captured `std::weak_ptr<Display>`.
  6. The `Display` object has been destroyed, so `lock()` returns an empty `std::shared_ptr`.
  7. The `if` branch fails, and the `else` branch prints `[Dead observer skipped]`, safely returning control without dereferencing a dangling pointer.
- **What breaks without this** — if `sensor.subscribe` accepted a raw pointer or if the lambda captured `this` directly (`[this](int temp) { this->update(temp); }`), the second call to `setTemperature(30)` would invoke `update()` on a destroyed `Display` object, leading to Undefined Behavior and a likely segfault.
- **Exercises** — 
  - Add a `Logger` class that also observes the `Sensor` and prints the time alongside the temperature.
  - Modify `Sensor::notify()` to remove dead callbacks from the `observers` vector instead of just skipping them.
- **Definition of done** —
  - `Sensor` maintains a list of generic `std::function` callbacks.
  - `Sensor` notifies all callbacks when its state changes.
  - Listeners use `std::weak_ptr` to ensure they are not invoked after destruction.
  - Code compiles without warnings (`g++ -Wall -Wextra -std=c++17 main.cpp -o observer`).
  - `git commit -m "Implement safe Observer pattern with std::function and std::weak_ptr to decouple event listeners without risking dangling pointers"`
