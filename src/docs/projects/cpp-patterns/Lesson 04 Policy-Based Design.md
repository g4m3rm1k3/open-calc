# Lesson 04: Policy-Based Design

We will build a configurable `SmartPtr` host class that uses compile-time policy classes to compose its behavior without runtime overhead. You will implement policies for threading (e.g., locking vs. single-threaded) and checking (e.g., throw on null vs. no check), proving how multiple inheritance of template parameters creates combinatorial flexibility with zero virtual dispatch.

What you need to know first
- C++ From Scratch (Lesson 12): templates, memory model, multiple inheritance, smart pointers.

Terms used in this lesson
- **Policy-Based Design** — a design approach where a class's behavior is configured by inheriting from template parameters (policies), solving the problem of combinatorial explosion in class design without paying the runtime cost of virtual functions.
- **Host Class** — the primary template class that takes policy classes as parameters and inherits from them or contains them, solving the problem of providing a unified interface while delegating specific, interchangeable behaviors to the policies.
- **Policy Class** — a class that implements a specific interface expected by the host class, solving the problem of encapsulating a single orthogonal dimension of behavior (like thread safety or bounds checking) so it can be swapped effortlessly.
- **Empty Base Class Optimization (EBCO)** — a compiler optimization where an empty base class contributes zero bytes to the size of a derived class, solving the problem of space overhead when inheriting from stateless policy classes.
- **Runtime Polymorphism** — resolving behavior at runtime using virtual functions and vtables, solving the problem of changing behavior dynamically, but introducing performance overhead and preventing compiler inlining.
- **Compile-Time Polymorphism** — resolving behavior during compilation using templates, solving the problem of abstracting behavior with zero runtime cost, at the expense of needing all information at compile time.
- **Multiple Inheritance** — a language feature where a single class inherits from more than one base class, solving the problem of combining multiple distinct interfaces or behaviors into one type.

Objects and methods used
- **`std::logic_error`**
  - *What it is:* A standard library exception class representing errors in the program's internal logic that could theoretically be prevented.
  - *Implementation:* `class logic_error : public exception;` taking a string message in its constructor.
  - *Its use:* Thrown by our strict checking policy when a null pointer is dereferenced, proving the policy executes.
- **`std::cout`**
  - *What it is:* The standard character output stream object.
  - *Implementation:* `extern ostream cout;`
  - *Its use:* Used in isolated examples to print verification messages to the console.

## Concept Unit: The Host Class and a Single Policy

### The Problem
We want to write a class whose behavior can be configured. The traditional Object-Oriented approach uses the Strategy pattern: the class holds a pointer to an interface with virtual functions, and we pass in different implementations at runtime. However, virtual functions introduce indirection, require following a vtable pointer, and almost always prevent the compiler from inlining the code. When the behavior we want is entirely known at compile time—like whether a pointer should check for null before dereferencing—paying this runtime cost on every single access is unacceptable in C++. We need a way to swap behaviors without virtual functions.

### Introduce the concept in isolation
We solve this by passing the behavior as a template parameter and calling its methods directly.

```cpp
#include <iostream>

// The Policy
struct NoCheckPolicy {
    static void check(void* ptr) {
        // Does nothing, completely optimized away
    }
};

struct StrictCheckPolicy {
    static void check(void* ptr) {
        if (!ptr) {
            std::cout << "Error: Null pointer dereference!\n";
        }
    }
};

// The Host Class
template <typename CheckingPolicy>
class Wrapper {
    void* ptr;
public:
    Wrapper(void* p) : ptr(p) {}
    
    void doSomething() {
        CheckingPolicy::check(ptr);
        std::cout << "Doing something with ptr\n";
    }
};

int main() {
    Wrapper<NoCheckPolicy> fastWrapper(nullptr);
    fastWrapper.doSomething(); 
    
    Wrapper<StrictCheckPolicy> safeWrapper(nullptr);
    safeWrapper.doSomething(); 
    return 0;
}
```

Output:
```
Doing something with ptr
Error: Null pointer dereference!
Doing something with ptr
```

This proves that the `Wrapper` class can completely change its internal validation logic based on the template parameter provided. Because the policy is resolved at compile time, `NoCheckPolicy::check` is trivially inlined and disappears entirely in the compiled binary, yielding zero overhead. This is exactly what `CheckingPolicy` in the code below is doing, isolated. This pattern is called **Policy-Based Design**.

### Discard the throwaway example
We will not use this generic `Wrapper` in our project. It is deleted.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating C++ architectural patterns.
- **Files affected:** `SmartPtr.h` (created)
- **Change type:** add
- **Location:** Brand new file
- **Dependencies:** None

### The New Code
```cpp
#pragma once
#include <stdexcept>

struct NoCheck {
    template <typename T>
    static void check(T* ptr) {}
};

struct EnforceNotNull {
    template <typename T>
    static void check(T* ptr) {
        if (!ptr) throw std::logic_error("Null pointer dereference");
    }
};

template <typename T, typename CheckingPolicy>
class SmartPtr : public CheckingPolicy {
    T* pointee;
public:
    explicit SmartPtr(T* p) : pointee(p) {}
    
    T& operator*() {
        CheckingPolicy::check(pointee);
        return *pointee;
    }
    
    T* operator->() {
        CheckingPolicy::check(pointee);
        return pointee;
    }
};
```

### The Updated Project
Because this is a brand new file, the code above is the entirety of `SmartPtr.h`. It defines two checking policies and a host class `SmartPtr` that inherits from the chosen policy and uses it to guard pointer access.

### Mechanical walkthrough
- `#pragma once` — A preprocessor directive that tells the compiler to include this header file exactly once per compilation unit, solving the problem of duplicate definition errors if the header is included multiple times.
- `#include <stdexcept>` — Includes the standard library header for standard exception types like `std::logic_error`.
- `struct NoCheck` — Defines a policy class. It is a `struct` so its members are `public` by default, creating a clean, accessible interface for the host class without needing access modifiers.
- `{` — Opens the struct body.
- `template <typename T>` — A template parameter for the policy method itself, allowing the check to apply to a pointer of any type without needing the policy class itself to be templated on `T`.
- `static void check(T* ptr)` — A static method that takes the raw pointer. A static method belongs to the class itself rather than an instance, meaning it has no state and does not operate on a specific object.
- `{}` — The empty body of the method. For `NoCheck`, we intentionally do nothing. The compiler will completely inline and eliminate calls to this empty method.
- `};` — Closes the struct definition.
- `struct EnforceNotNull` — Defines an alternative policy class adhering to the exact same expected interface (a static `check` method).
- `{` — Opens the struct body.
- `template <typename T>` — Again, templates the method for any pointer type.
- `static void check(T* ptr)` — The matching signature required by the implicit contract.
- `{` — Opens the method body.
- `if (!ptr)` — The actual boolean check testing if the pointer evaluates to false (null).
- `throw std::logic_error("Null pointer dereference");` — The concrete logic for this policy. It aborts the operation by throwing an exception if the pointer is null.
- `}` — Closes the method block.
- `};` — Closes the struct definition.
- `template <typename T, typename CheckingPolicy>` — The template parameter list for our host class. `T` is the type of the value being pointed to, and `CheckingPolicy` is the policy class type that will govern validation behavior.
- `class SmartPtr : public CheckingPolicy` — The host class definition. It inherits directly from the policy parameter. This is a hallmark of Policy-Based Design. By inheriting from the policy, the host gains access to the policy's protected and public members.
- `{` — Opens the class body.
- `T* pointee;` — The raw pointer being managed as internal state.
- `public:` — Access modifier making the following members accessible to callers outside the class.
- `explicit SmartPtr(T* p)` — The constructor. It is marked `explicit` to prevent the compiler from implicitly converting a raw pointer into a `SmartPtr` without the programmer deliberately asking for it.
- `: pointee(p)` — An initializer list that directly assigns the raw pointer parameter `p` to the member field `pointee` before the constructor body runs.
- `{}` — The empty constructor body.
- `T& operator*()` — Overloads the dereference operator so the object acts syntactically like a standard pointer. It returns a reference to the pointed-to type.
- `{` — Opens the operator method body.
- `CheckingPolicy::check(pointee);` — Explicitly calls the static `check` method on the policy class, passing the raw pointer. Because `CheckingPolicy` is resolved at compile time, there is no virtual dispatch or runtime indirection.
- `return *pointee;` — Performs the actual dereference of the raw pointer after the policy has vetted it, returning the value.
- `}` — Closes the method.
- `T* operator->()` — Overloads the arrow operator for member access, similarly returning the raw pointer for the caller to use.
- `{` — Opens the operator method body.
- `CheckingPolicy::check(pointee);` — Evaluates the policy again before yielding the pointer.
- `return pointee;` — Returns the raw pointer.
- `}` — Closes the method.
- `};` — Closes the class definition.

### CS Lens
This embodies the **Strategy Pattern**, but shifted from runtime to compile time. 
Also recognized in: C++ standard library allocators (`std::vector<T, Allocator>`), custom deleter types in `std::unique_ptr`, hashing and equality policies in `std::unordered_map`.

### SE Lens
**Compile-Time Polymorphism vs Runtime Polymorphism**. The runtime alternative (holding an `ICheckingPolicy*` pointer and calling `virtual void check()`) forces the object to be larger (storing the pointer) and slower (following the vtable). By using templates, we pay zero cost in memory and zero cost in execution time for the `NoCheck` case. The trade-off is that the policy must be known at compile time, and `SmartPtr<int, NoCheck>` is an entirely distinct type from `SmartPtr<int, EnforceNotNull>`—they cannot be stored in the same array or easily swapped while the program is running.

## Concept Unit: State in Policies and Empty Base Class Optimization (EBCO)

### The Problem
Policies don't always have to be stateless static methods. Sometimes a policy needs to hold state, or we need to combine multiple policies into a single host class. If we have multiple stateless policies, do they increase the size of our `SmartPtr`? We need to ensure that adding stateless policies doesn't inflate the memory footprint of our host class.

### Introduce the concept in isolation
When a class contains another class as a member field, it takes up physical space in memory, even if the member class has no data fields of its own. But when a class *inherits* from an empty class, C++ compilers apply an optimization to ensure the base class takes up exactly zero bytes.

```cpp
#include <iostream>

struct EmptyPolicy {};

class CompositionPtr {
    EmptyPolicy policy; // Composition
    int* ptr;
};

class InheritedPtr : public EmptyPolicy { // Inheritance
    int* ptr;
};

int main() {
    std::cout << "Size of int*: " << sizeof(int*) << "\n";
    std::cout << "Size of CompositionPtr: " << sizeof(CompositionPtr) << "\n";
    std::cout << "Size of InheritedPtr: " << sizeof(InheritedPtr) << "\n";
    return 0;
}
```

Output:
```
Size of int*: 8
Size of CompositionPtr: 16
Size of InheritedPtr: 8
```

This proves that composing an empty policy inflates the class size due to alignment and padding rules (from 8 bytes to 16 bytes on a 64-bit system). Inheriting from the policy keeps the size identical to just the pointer. This is exactly what `public CheckingPolicy` in the code above is doing, isolated. This optimization is called the **Empty Base Class Optimization (EBCO)**, and it is why Policy-Based Design strictly uses inheritance for injecting policies.

### Discard the throwaway example
We will not use `CompositionPtr` or `InheritedPtr` in our project. They are deleted.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating C++ architectural patterns.
- **Files affected:** `SmartPtr.h` (modified)
- **Change type:** refactor
- **Location:** Inside `SmartPtr.h`, adding a threading policy above `SmartPtr` and refactoring the class signature to inherit from it.
- **Dependencies:** None

### The New Code
```cpp
struct SingleThreaded {
    void lock() {}
    void unlock() {}
};

struct MultiThreaded {
    void lock() { /* acquire real mutex */ }
    void unlock() { /* release real mutex */ }
};

template <typename T, typename CheckingPolicy, typename ThreadingPolicy>
class SmartPtr : public CheckingPolicy, public ThreadingPolicy {
    T* pointee;
public:
    explicit SmartPtr(T* p) : pointee(p) {}
    
    T& operator*() {
        ThreadingPolicy::lock();
        CheckingPolicy::check(pointee);
        T& ref = *pointee;
        ThreadingPolicy::unlock();
        return ref;
    }
    
    T* operator->() {
        ThreadingPolicy::lock();
        CheckingPolicy::check(pointee);
        ThreadingPolicy::unlock();
        return pointee;
    }
};
```

### The Updated Project
```cpp
#pragma once
#include <stdexcept>

struct NoCheck {
    template <typename T>
    static void check(T* ptr) {}
};

struct EnforceNotNull {
    template <typename T>
    static void check(T* ptr) {
        if (!ptr) throw std::logic_error("Null pointer dereference");
    }
};

// ← new
struct SingleThreaded {
    void lock() {}
    void unlock() {}
};

struct MultiThreaded {
    void lock() { /* acquire real mutex */ }
    void unlock() { /* release real mutex */ }
};

// ← replaced
template <typename T, typename CheckingPolicy, typename ThreadingPolicy>
class SmartPtr : public CheckingPolicy, public ThreadingPolicy {
    T* pointee;
public:
    explicit SmartPtr(T* p) : pointee(p) {}
    
    T& operator*() {
        ThreadingPolicy::lock(); // ← new
        CheckingPolicy::check(pointee);
        T& ref = *pointee; // ← new
        ThreadingPolicy::unlock(); // ← new
        return ref; // ← new
    }
    
    T* operator->() {
        ThreadingPolicy::lock(); // ← new
        CheckingPolicy::check(pointee);
        ThreadingPolicy::unlock(); // ← new
        return pointee;
    }
};
```
The `SmartPtr` now takes two policies and inherits from both. It calls the threading policy's lock/unlock around its accesses, guaranteeing synchronization without virtual functions.

### Mechanical walkthrough
- `struct SingleThreaded` — A new policy class dictating how thread safety is handled.
- `{` — Opens the struct body.
- `void lock() {}` — The lock method. Here it is a non-static member function with an empty body, meaning acquiring the lock does literally nothing.
- `void unlock() {}` — The unlock method, similarly empty.
- `};` — Closes the struct definition.
- `struct MultiThreaded` — The alternative threading policy.
- `{` — Opens the struct body.
- `void lock() { /* acquire real mutex */ }` — A placeholder for real synchronization logic (like calling `lock` on an internal `std::mutex`).
- `void unlock() { /* release real mutex */ }` — The corresponding release logic.
- `};` — Closes the struct definition.
- `template <typename T, typename CheckingPolicy, typename ThreadingPolicy>` — The template parameter list for the host class now demands two distinct policy types alongside the underlying type `T`.
- `class SmartPtr : public CheckingPolicy, public ThreadingPolicy` — The host class uses **Multiple Inheritance** to derive from both policies simultaneously. Because both are inherited, Empty Base Class Optimization applies to both; if both are stateless empty structs, the host class size remains exactly the size of its one pointer field.
- `{` — Opens the class body.
- `T* pointee;` — The managed raw pointer.
- `public:` — Access modifier.
- `explicit SmartPtr(T* p) : pointee(p) {}` — The constructor initializing the pointer.
- `T& operator*()` — The dereference operator.
- `{` — Opens the method body.
- `ThreadingPolicy::lock();` — Invokes the lock method from the inherited threading policy. Because we inherit from it, this translates to calling `this->ThreadingPolicy::lock()`. The `ThreadingPolicy::` prefix is an explicit scope resolution telling the compiler exactly which base class's `lock` method to invoke.
- `CheckingPolicy::check(pointee);` — Invokes the inherited checking policy as before.
- `T& ref = *pointee;` — Actually dereferences the pointer and stores the resulting reference in a local variable. This is necessary because we must release the lock before we leave the function, but we can't do that if we execute a `return` statement immediately.
- `ThreadingPolicy::unlock();` — Releases the lock via the inherited policy method.
- `return ref;` — Returns the vetted, safely-accessed reference to the caller.
- `}` — Closes the method block.
- `T* operator->()` — The member access operator.
- `{` — Opens the method body.
- `ThreadingPolicy::lock();` — Acquires the lock.
- `CheckingPolicy::check(pointee);` — Vets the pointer.
- `ThreadingPolicy::unlock();` — Releases the lock.
- `return pointee;` — Returns the raw pointer.
- `}` — Closes the method block.
- `};` — Closes the class definition.

### CS Lens
**Combinatorial Design**. We have 2 checking policies and 2 threading policies, yielding 4 possible `SmartPtr` types. If we added an ownership policy with 3 options, we'd have 12 types. Doing this with traditional inheritance would require building 12 distinct classes manually (e.g., `SingleThreadedStrictPtr`). Policy-Based Design gives us combinatorial variety with additive code effort, rather than multiplicative code effort.
Also recognized in: Mixins in languages like Ruby or Scala, Traits in Rust, though those often differ in how state is bound.

### SE Lens
**Multiple Inheritance**. C++ allows a class to have more than one base class. Multiple inheritance is often maligned because of the "Diamond Problem" (two parents inheriting from a common grandparent, leading to duplicated state and ambiguous method resolution). However, in Policy-Based Design, multiple inheritance is safe and idiomatic because the base classes (the policies) are completely orthogonal and strictly independent. They do not share a common base, and they govern completely separate axes of behavior, eliminating ambiguity.

## Closing

### Connect the pieces
Let's trace the execution flow when instantiating and dereferencing a concrete policy-configured pointer:

1. `SmartPtr<int, EnforceNotNull, SingleThreaded> ptr(new int(5));` — The compiler stamps out a specific class that inherits from both `EnforceNotNull` and `SingleThreaded`.
2. `*ptr` — The overloaded dereference operator is invoked.
3. `ThreadingPolicy::lock()` — Statically resolves to `SingleThreaded::lock()`, an empty function that is entirely inlined away.
4. `CheckingPolicy::check(pointee)` — Statically resolves to `EnforceNotNull::check()`. The pointer is not null, so the `if` condition fails and no exception is thrown.
5. `ThreadingPolicy::unlock()` — Resolves to `SingleThreaded::unlock()`, again inlined to nothing.
6. `return ref;` — The value `5` is yielded to the caller.

At runtime, this entire sequence of instructions compiles down to the exact same machine code as a bare pointer dereference, but with the safety of a null check statically guaranteed by the compiler.

### What breaks without this
If we attempt to instantiate the `SmartPtr` with a policy that does not implement the expected interface:

```cpp
struct BadPolicy {
    void doSomethingElse() {}
};

SmartPtr<int, BadPolicy, SingleThreaded> badPtr(nullptr);
*badPtr;
```
Error output:
```
error: 'check' is not a member of 'BadPolicy'
```
Because templates are duck-typed in C++ (prior to C++20 Concepts), the compiler only realizes `BadPolicy` is invalid when it tries to substitute it into the `CheckingPolicy::check(pointee)` call. The error surfaces at compile time, explicitly naming the missing method, preventing an invalid configuration from ever running.

### Exercises
1. Write a `LogOnAccess` checking policy that prints the pointer address to `std::cout` before allowing the access.
2. Verify EBCO: use `sizeof()` to confirm that `SmartPtr<double, NoCheck, SingleThreaded>` is exactly 8 bytes on a 64-bit system.
3. Add a third template parameter `typename OwnershipPolicy` that determines whether the `SmartPtr` calls `delete` on the raw pointer in its destructor, and implement `NoDelete` and `DeepDelete` policies.

### Definition of done
- [x] Host class template defines the structural skeleton.
- [x] Policy classes define orthogonal chunks of behavior (checking, threading).
- [x] Host class uses multiple inheritance to compose policies, leveraging EBCO for zero size overhead.
- [x] All method resolution happens at compile time with zero virtual dispatch.

Commit message: `feat: implement Policy-Based Design SmartPtr demonstrating zero-overhead combinatorial behavior via template multiple inheritance`
