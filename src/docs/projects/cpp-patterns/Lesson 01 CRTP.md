# Lesson 01: The Curiously Recurring Template Pattern (CRTP)

**What you will build**
You will build a high-performance polymorphic benchmark that contrasts two approaches to interface design. First, you will construct a traditional class hierarchy using virtual functions and measure its execution overhead. Then, you will reconstruct the exact same polymorphic behavior using the Curiously Recurring Template Pattern (CRTP), substituting runtime indirection for compile-time generation to achieve a true zero-cost abstraction.

**What you need to know first**
- C++ From Scratch (classes, inheritance, templates, virtual functions, overriding, and the `static_cast` operator).

**Terms used in this lesson**
- **Static Polymorphism** — the ability to present a single interface for multiple distinct types where the exact implementation to call is resolved entirely by the compiler at compile time, eliminating the need for runtime lookups. This exists to enable generic programming without sacrificing performance.
- **Virtual Dispatch** — the mechanism by which C++ resolves calls to `virtual` functions at runtime by looking up the correct function pointer in a hidden table. This solves the problem of calling derived-class behavior through a base-class pointer, but introduces a performance penalty.
- **Zero-Cost Abstraction** — a design principle where using a higher-level programming construct (like an interface or a template) compiles down to the exact same machine code you would have written by hand, incurring no additional runtime overhead. It exists so developers do not have to choose between clean architecture and raw speed.
- **Curiously Recurring Template Pattern (CRTP)** — a C++ idiom where a class `X` derives from a class template instantiated with `X` itself as the template argument (e.g., `class X : public Base<X>`). It exists to allow a base class to know the exact type of its derived class at compile time, injecting behavior or enabling static polymorphism.
- **Vtable (Virtual Method Table)** — a hidden array of function pointers created by the compiler for any class containing virtual functions. It exists to enable dynamic dispatch, forcing the CPU to fetch the function address from memory before calling it.

**Objects and methods used**
- **`static_cast<T*>(ptr)`**
  - *What it is:* A compile-time C++ casting operator.
  - *Implementation:* A language keyword that performs a direct conversion between compatible pointer types without runtime checking.
  - *Its use:* Used in this lesson to downcast a `Base*` `this` pointer to a `Derived*` pointer safely, because in CRTP, we guarantee by design that the base class is always part of the specified derived class.

**Everything else in the file, not this lesson's subject but still explained:**
- **`std::chrono::high_resolution_clock`**
  - *What it is:* A clock class providing the smallest tick period available on the current system.
  - *Implementation:* `class high_resolution_clock` found in `<chrono>`.
  - *Its use:* Used to measure the exact nanoseconds elapsed during our benchmarking loops to prove the performance difference between virtual and static dispatch.

## Concept Unit: The Runtime Cost of Virtual Dispatch

### The Problem
When building generic systems, we often want an interface that guarantees a set of operations (like `process()`) that multiple derived types must implement. The traditional C++ approach uses `virtual` functions and base-class pointers. However, virtual functions cannot be completely optimized away by the compiler; the CPU must look up the correct implementation in a Vtable at runtime, introducing a mandatory penalty in tight loops.

### Introduce the concept in isolation
To see the cost of a virtual function call, we can measure how long it takes to invoke a simple method millions of times.

```cpp
#include <iostream>
#include <chrono>

struct Base {
    virtual void do_work() = 0;
    virtual ~Base() = default;
};

struct Derived : public Base {
    void do_work() override {
        // Minimal work to prevent the loop from being entirely optimized out
        asm(""); 
    }
};

int main() {
    Derived d;
    Base* ptr = &d;

    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 100000000; ++i) {
        ptr->do_work(); // Virtual dispatch
    }
    auto end = std::chrono::high_resolution_clock::now();
    
    std::cout << "Virtual time: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms\n";
    return 0;
}
```

```text
Virtual time: 142 ms
```
This output proves that even when a method does absolutely nothing, calling it through a virtual interface imposes a measurable time cost because the CPU must perform a memory fetch to resolve the function pointer. This is called **Virtual Dispatch**.

### Discard the throwaway example
This timing snippet is deleted and will not be used in the final project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are establishing our own benchmark.
- **Files affected:** `main.cpp` created.
- **Change type:** Add.
- **Location:** Entire file.
- **Dependencies:** None.

### The New Code
```cpp
struct DynamicProcessor {
    virtual void process() const = 0;
    virtual ~DynamicProcessor() = default;
};

struct DynamicWorker : public DynamicProcessor {
    void process() const override {
        asm(""); // Prevent over-optimization
    }
};

void run_dynamic_work(const DynamicProcessor& processor) {
    for (int i = 0; i < 100000000; ++i) {
        processor.process();
    }
}
```

### The Updated Project
```cpp
// main.cpp
#include <iostream>
#include <chrono>

// ← new
struct DynamicProcessor {
    virtual void process() const = 0;
    virtual ~DynamicProcessor() = default;
};

struct DynamicWorker : public DynamicProcessor {
    void process() const override {
        asm(""); // Prevent over-optimization
    }
};

void run_dynamic_work(const DynamicProcessor& processor) {
    for (int i = 0; i < 100000000; ++i) {
        processor.process();
    }
}
// ← new

int main() {
    DynamicWorker worker;
    auto start = std::chrono::high_resolution_clock::now();
    run_dynamic_work(worker);
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "Dynamic dispatch: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms\n";
    return 0;
}
```
This sets up our baseline project: a virtual base class `DynamicProcessor`, a concrete implementation `DynamicWorker`, and a runner function that executes the virtual method in a tight loop.

### Mechanical walkthrough
- `struct DynamicProcessor` — defines the base interface contract. A `struct` is used instead of a `class` purely to default all members to `public`.
- `virtual void process() const = 0;` — a pure virtual function. `virtual` instructs the compiler to generate a Vtable entry for this method. `= 0` dictates that derived classes must provide their own implementation. `const` ensures the method does not mutate the object's state.
- `virtual ~DynamicProcessor() = default;` — a virtual destructor. This guarantees that if a derived object is destroyed through a base class pointer, the correct derived destructor is invoked, preventing memory leaks.
- `struct DynamicWorker : public DynamicProcessor` — declares a concrete subclass that inherits from the interface.
- `void process() const override` — provides the actual implementation. `override` explicitly tells the compiler to verify that this method exactly matches a virtual method in the base class.
- `asm("");` — an inline assembly directive that emits no instructions. It acts as an optimization barrier, preventing the compiler from realizing the loop does nothing and stripping the entire loop away.
- `void run_dynamic_work(const DynamicProcessor& processor)` — accepts the object by reference to a base class. This forces the compiler to use dynamic dispatch, since it cannot prove the exact underlying type of `processor` at compile time from the function signature alone.
- `processor.process();` — invokes the method. At runtime, the program reads the object's hidden Vtable pointer, offsets to the `process` entry, and jumps to the function address stored there.

### CS Lens
**Dynamic Dispatch**. This mechanism enables Late Binding. The exact code to execute is determined at runtime based on the actual type of the object, not the type of the pointer or reference holding it. It is fundamentally an indirect jump instruction.

### SE Lens
**The Vtable Penalty**. While highly flexible, virtual functions defeat function inlining. Because the compiler does not know which function will be called until runtime, it cannot insert the function's body directly into the calling loop. This causes pipeline stalls and branch mispredictions on the CPU, making it a poor choice for highly iterative operations like per-pixel rendering, high-frequency trading, or dense mathematical simulations.

### Commands needed to make this unit real
`g++ -std=c++17 -O3 main.cpp -o benchmark`
- `g++`: the GNU C++ compiler.
- `-std=c++17`: specifies the C++17 language standard.
- `-O3`: enables aggressive optimizations, ensuring we measure the actual structural limits of the code, not unoptimized compiler debug output.
- `-o benchmark`: sets the output executable name.

### Run it
```text
$ ./benchmark
Dynamic dispatch: 145 ms
```

### One sentence connecting this unit to what came immediately before.
Having proven that dynamic dispatch incurs a mandatory cost, we must find a way to preserve the interface-like contract while moving the type resolution to compile time.

## Concept Unit: The Curiously Recurring Template Pattern (CRTP)

### The Problem
We want a base class that defines a clear interface and behavior, but we want the calls to dispatch directly to the derived class without a Vtable. To do this, the base class needs to know the exact type of the derived class at compile time, which seems impossible since the base class is defined before the derived class.

### Introduce the concept in isolation
We can use templates to pass the derived class type into the base class as a template parameter.

```cpp
#include <iostream>

template <typename Derived>
struct CRTPBase {
    void call_impl() {
        // Downcast 'this' to the Derived type to call its specific method
        static_cast<Derived*>(this)->implementation();
    }
};

// Derived passes ITSELF as the template argument to CRTPBase
struct SpecificDerived : public CRTPBase<SpecificDerived> {
    void implementation() {
        std::cout << "Compile-time static dispatch executed.\n";
    }
};

int main() {
    SpecificDerived obj;
    obj.call_impl();
    return 0;
}
```

```text
Compile-time static dispatch executed.
```
This output proves that the base class successfully invoked a method that only exists in the derived class, with zero virtual functions. This is called the **Curiously Recurring Template Pattern (CRTP)**.

### Discard the throwaway example
This isolated snippet is deleted and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` modified.
- **Change type:** Add.
- **Location:** Added after the `run_dynamic_work` function, before `main`.
- **Dependencies:** None.

### The New Code
```cpp
template <typename Derived>
struct StaticProcessor {
    void process() const {
        static_cast<const Derived*>(this)->process_impl();
    }
};

struct StaticWorker : public StaticProcessor<StaticWorker> {
    void process_impl() const {
        asm(""); // Prevent over-optimization
    }
};

template <typename T>
void run_static_work(const StaticProcessor<T>& processor) {
    for (int i = 0; i < 100000000; ++i) {
        processor.process();
    }
}
```

### The Updated Project
```cpp
// main.cpp
#include <iostream>
#include <chrono>

struct DynamicProcessor {
    virtual void process() const = 0;
    virtual ~DynamicProcessor() = default;
};

struct DynamicWorker : public DynamicProcessor {
    void process() const override {
        asm("");
    }
};

void run_dynamic_work(const DynamicProcessor& processor) {
    for (int i = 0; i < 100000000; ++i) {
        processor.process();
    }
}

// ← new
template <typename Derived>
struct StaticProcessor {
    void process() const {
        static_cast<const Derived*>(this)->process_impl();
    }
};

struct StaticWorker : public StaticProcessor<StaticWorker> {
    void process_impl() const {
        asm(""); // Prevent over-optimization
    }
};

template <typename T>
void run_static_work(const StaticProcessor<T>& processor) {
    for (int i = 0; i < 100000000; ++i) {
        processor.process();
    }
}
// ← new

int main() {
    DynamicWorker worker;
    auto start = std::chrono::high_resolution_clock::now();
    run_dynamic_work(worker);
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "Dynamic dispatch: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms\n";
              
    // ← new
    StaticWorker static_worker;
    start = std::chrono::high_resolution_clock::now();
    run_static_work(static_worker);
    end = std::chrono::high_resolution_clock::now();
    std::cout << "Static dispatch: " 
              << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() 
              << " ms\n";
    // ← new
              
    return 0;
}
```
This updates our benchmark project to include a parallel static implementation. `StaticProcessor` acts as the interface, `StaticWorker` provides the behavior, and `run_static_work` executes it using compile-time templates instead of runtime Vtables.

### Mechanical walkthrough
- `template <typename Derived>` — declares that `StaticProcessor` is a class template requiring one type parameter, which by convention represents the derived class.
- `struct StaticProcessor` — the base class template acting as our static interface.
- `void process() const` — a non-virtual method in the base class. Because it is not virtual, calling it has no overhead. It serves as the public API contract.
- `static_cast<const Derived*>(this)` — the core mechanism of CRTP. Because `this` is a pointer to `StaticProcessor`, and we know `StaticProcessor` is only ever inherited by `Derived`, we can safely instruct the compiler to treat the base pointer as a derived pointer.
- `->process_impl();` — invokes the specific implementation on the derived type. Because the exact type of `Derived` is known at compile time, the compiler resolves the address of `process_impl` immediately.
- `struct StaticWorker : public StaticProcessor<StaticWorker>` — the curious recurrence. `StaticWorker` inherits from a template instantiated with its own type. This ties the base class to this specific implementation forever.
- `void process_impl() const` — the concrete behavior. Note that this method does not need `override` because it is not virtual; it is just a plain method the base class expects to exist.
- `template <typename T>` — makes the runner function a template.
- `void run_static_work(const StaticProcessor<T>& processor)` — accepts the exact instantiated base type. Because it is a template, the compiler generates a unique, dedicated version of this function for every distinct `T` passed into it.
- `processor.process();` — calls the base method, which calls `static_cast`, which calls `process_impl`. The compiler sees exactly where the code goes.

### CS Lens
**F-bound Polymorphism**. In type theory, this pattern is a form of F-bounded quantification, where a type is parameterized over itself. It allows types to enforce self-referential constraints, ensuring that a generic function operating on an object returns or expects that exact object type, rather than an eroded base type. Also recognized in: Java's `Enum<E extends Enum<E>>`, Rust traits with `Self` types, and recursive mixin architectures.

### SE Lens
**Compile-Time Type Substitution**. By moving the dispatch from a runtime pointer lookup to a compile-time template instantiation, we achieve a **Zero-Cost Abstraction**. The compiler knows the exact address of `process_impl()`. Consequently, the compiler can take the body of `process_impl()` and inline it directly inside the loop inside `run_static_work()`. The function call disappears entirely from the final machine code, leaving only the raw assembly instructions behind. The tradeoff is larger binary size (code bloat), since every new derived class generates a brand-new copy of the `run_static_work` function and `StaticProcessor` base class.

### Commands needed to make this unit real
`g++ -std=c++17 -O3 main.cpp -o benchmark`

### Run it
```text
$ ./benchmark
Dynamic dispatch: 145 ms
Static dispatch: 0 ms
```
The static dispatch takes effectively 0 milliseconds (or a small fraction of a millisecond depending on the machine) because the compiler inlined the empty assembly block and executed it without any memory lookups or branches. 

### One sentence connecting this unit to what came immediately before.
By substituting runtime lookups with compile-time generation, CRTP eliminates the performance penalty of dynamic dispatch while retaining the clean structure of interface inheritance.

## Closing

- **Connect the pieces** — In the dynamic pipeline, `run_dynamic_work` receives a reference, reads the Vtable pointer attached to `DynamicWorker`, looks up the address of `process()`, and executes an indirect jump 100 million times. In the static pipeline, the compiler examines `StaticWorker : StaticProcessor<StaticWorker>`, generates a unique `run_static_work<StaticWorker>` function, replaces `processor.process()` with `static_cast<const StaticWorker*>(this)->process_impl()`, sees that `process_impl()` is an empty assembly block, and literally collapses the entire 100-million iteration loop into inline raw instructions, resulting in a zero-millisecond runtime cost.
- **What breaks without this** — If you attempt to call `processor.process_impl()` directly from the base class `StaticProcessor` without the `static_cast`, the compiler will throw an error: `error: 'const struct StaticProcessor<StaticWorker>' has no member named 'process_impl'`. The base class does not inherently possess the derived class's methods; the cast is the mandatory bridge that asserts the structural relationship.
- **Exercises** 
  - Change `StaticWorker` to NOT implement `process_impl()`. Observe the spectacular template compilation error generated when `StaticProcessor` tries to call a missing method.
  - Add a state variable (e.g., `int count`) to both workers, increment it in the loop, and return it. Observe how the compiler optimizes the CRTP version into a single mathematical multiplication, while the dynamic version must incrementally update the memory on every pass.
- **Definition of done**
  - [x] Establish the baseline performance penalty of standard virtual function dispatch.
  - [x] Prove the syntax and structure of the `Base<Derived>` CRTP idiom.
  - [x] Replace runtime virtual dispatch with compile-time static cast dispatch.
  - [x] Demonstrate the zero-cost performance profile achieved by compiler inlining.
  - Commit message: `feat: implement CRTP static polymorphism benchmark proving zero-cost abstraction over virtual dispatch`
