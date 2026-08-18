# Lesson 02: Type Erasure

We will build a heterogeneous container capable of holding unrelated types that share a common behavior, without forcing them to inherit from a shared base class. This solves the architectural problem of intrusive inheritance — where third-party or foundational classes must be modified just to be placed in a common collection — by erasing the specific type at the boundary and storing only its capabilities.

**What you need to know first:**
- C++ From Scratch (templates, virtual functions, smart pointers)

**Terms used in this lesson:**
- **Heterogeneous collection** — A container (like an array or list) that holds objects of different, distinct types. C++ collections are strictly homogeneous by default; building a heterogeneous one requires explicit design.
- **Intrusive inheritance** — The requirement that a class explicitly declare `class A : public Base` to participate in a system. It fails when you cannot modify the class (like `std::string` or a third-party type) to add the inheritance.
- **Duck typing** — A programming concept where an object's suitability is determined by the presence of certain methods, rather than its actual type or inheritance tree ("If it walks like a duck and quacks like a duck..."). Templates support compile-time duck typing; type erasure enables runtime duck typing.
- **Type Erasure** — A design pattern that provides a non-templated interface to templated, type-specific behavior. It hides the concrete type of an object from the user of the wrapper, preserving only the specific operations the wrapper promises to support.
- **Concept-Model Idiom** — The specific C++ implementation technique for type erasure, utilizing a non-templated wrapper class holding a pointer to a private abstract base class (the "Concept"), which is implemented by a private templated derived class (the "Model").
- **Small Buffer Optimization (SBO)** — A performance optimization where small objects are stored directly inside the wrapper class's own memory footprint rather than allocating them on the heap, preventing cache misses and allocation overhead.

**Objects and methods used:**
- **`std::unique_ptr`**
  - *What it is:* A smart pointer that retains sole ownership of an object through a pointer and destroys that object when the `unique_ptr` goes out of scope.
  - *Implementation:* `std::unique_ptr<T>` template class.
  - *Its use:* Used inside our type-erased wrapper to hold the heap-allocated type-specific model, ensuring automatic cleanup.
- **`std::any`**
  - *What it is:* A standard library class that can hold a single value of any copy-constructible type.
  - *Implementation:* `class any` in `<any>`.
  - *Its use:* Provides unrestricted type erasure when you just need to hold *something* without knowing its type or calling any methods on it.
- **`std::variant`**
  - *What it is:* A type-safe union that holds a value of one of a predefined set of types.
  - *Implementation:* `std::variant<Types...>` template class in `<variant>`.
  - *Its use:* The alternative to type erasure when the set of possible types is known at compile time and closed.
- **`std::function`**
  - *What it is:* A general-purpose polymorphic function wrapper.
  - *Implementation:* `std::function<R(Args...)>` template class in `<functional>`.
  - *Its use:* The standard library's most common example of type erasure, capable of storing and invoking any callable target (function, lambda, bind expression, or functor) that matches the signature.

---

## Concept Unit: The Heterogeneous Collection Problem

### The Problem

C++ is statically and strongly typed. A `std::vector<T>` requires every element to be exactly type `T`. If you want a list of shapes, and you have a `Circle` and a `Square`, you cannot put them in a `std::vector<Circle>`.

The classical Object-Oriented approach is to create an abstract base class `Shape` with virtual methods, make `Circle` and `Square` inherit from it, and use a `std::vector<std::unique_ptr<Shape>>`. 

This works until you encounter types you cannot modify. If you want to store a `std::string` and an `int`, or a class from a third-party library, you cannot force them to inherit from your `Printable` base class. You need a way to hold unrelated types in a single collection and invoke a common behavior on them, *without* intrusive inheritance.

### Isolate the Concept

Here is the failure of the classical inheritance model when faced with unmodifiable types.

```cpp
#include <iostream>
#include <vector>
#include <memory>
#include <string>

// Classical OOP requirement: everything must inherit from this.
class Printable {
public:
    virtual ~Printable() = default;
    virtual void print() const = 0;
};

// We control this, so we can inherit.
class Report : public Printable {
public:
    void print() const override {
        std::cout << "Printing report\n";
    }
};

// We DO NOT control std::string. We cannot make it inherit from Printable.
// std::string my_string = "Hello"; 

int main() {
    std::vector<std::unique_ptr<Printable>> docs;
    docs.push_back(std::make_unique<Report>());
    
    // ERROR: std::string is not a Printable.
    // docs.push_back(std::make_unique<std::string>("Cannot do this"));
    
    for (const auto& doc : docs) {
        doc->print();
    }
    return 0;
}
```

**Output:**
```
Printing report
```

This output proves the limitation: classical polymorphism requires controlling the inheritance tree. We can print the `Report`, but we are structurally blocked from putting an unrelated or standard library type into the same container.

### Discard the throwaway example

We will not use this classical inheritance approach. We will delete it and build a type-erased wrapper instead.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building a fundamental pattern from the ground up.
- **Files affected:** `main.cpp` (created)
- **Change type:** Add
- **Location:** At the top of the file.
- **Dependencies:** `<iostream>`, `<memory>`, `<vector>`, `<string>`, `<utility>`

### The New Code

```cpp
#include <iostream>
#include <memory>
#include <vector>
#include <string>
#include <utility>

class AnyPrinter {
private:
    struct Concept {
        virtual ~Concept() = default;
        virtual void print() const = 0;
        virtual std::unique_ptr<Concept> clone() const = 0;
    };

    template <typename T>
    struct Model : Concept {
        T data;
        Model(T val) : data(std::move(val)) {}
        void print() const override {
            std::cout << data << '\n';
        }
        std::unique_ptr<Concept> clone() const override {
            return std::make_unique<Model>(data);
        }
    };

    std::unique_ptr<Concept> pimpl;

public:
    template <typename T>
    AnyPrinter(T val) : pimpl(std::make_unique<Model<T>>(std::move(val))) {}

    AnyPrinter(const AnyPrinter& other) : pimpl(other.pimpl->clone()) {}
    
    AnyPrinter& operator=(const AnyPrinter& other) {
        pimpl = other.pimpl->clone();
        return *this;
    }

    AnyPrinter(AnyPrinter&&) noexcept = default;
    AnyPrinter& operator=(AnyPrinter&&) noexcept = default;

    void print() const {
        pimpl->print();
    }
};
```

### The Updated Project

```cpp
// main.cpp
// ← new code added here

int main() {
    std::vector<AnyPrinter> printers;
    printers.push_back(AnyPrinter(42));
    printers.push_back(AnyPrinter(std::string("Hello Type Erasure")));
    printers.push_back(AnyPrinter(3.14159));

    for (const auto& p : printers) {
        p.print();
    }
    return 0;
}
```

The `main` function now successfully holds an `int`, a `std::string`, and a `double` in the exact same `std::vector`, and can call `print()` on all of them.

### Mechanical Walkthrough

1. `class AnyPrinter`
   This is the non-templated wrapper class. Because it is not a template, `std::vector<AnyPrinter>` is a valid, concrete type. This is the boundary where type erasure occurs.

2. `struct Concept { virtual ~Concept() = default; virtual void print() const = 0; ... };`
   This is an abstract base class, hidden inside `AnyPrinter`'s private section. It defines the interface that we require from the types we hold. It has no knowledge of any specific type `T`.

3. `template <typename T> struct Model : Concept { ... };`
   This is a templated derived class, also hidden. It inherits from `Concept`. The compiler instantiates a brand new version of `Model` for every distinct type `T` we pass to `AnyPrinter`. 

4. `T data;`
   The `Model` holds the actual concrete value of type `T`.

5. `void print() const override { std::cout << data << '\n'; }`
   The `Model` implements the virtual `print()` method. It uses the type-specific behavior (in this case, `operator<<`) associated with `T`.

6. `std::unique_ptr<Concept> pimpl;`
   The `AnyPrinter` class holds a single pointer to the abstract `Concept`. This is a classic "Pointer to Implementation" (Pimpl). At runtime, this points to a specific `Model<T>`, but `AnyPrinter` itself only knows it holds a `Concept`.

7. `template <typename T> AnyPrinter(T val) : pimpl(std::make_unique<Model<T>>(std::move(val))) {}`
   The templated constructor. When you write `AnyPrinter(42)`, `T` is deduced as `int`. The constructor allocates a `Model<int>` on the heap, and stores it in the `pimpl` pointer. The exact type `T` is "erased" from `AnyPrinter`'s signature, captured permanently inside the heap-allocated `Model`.

8. `virtual std::unique_ptr<Concept> clone() const = 0;` and its implementation
   Because `AnyPrinter` holds a `std::unique_ptr`, it is move-only by default. To allow copying an `AnyPrinter`, we must be able to deep-copy the underlying data. However, `AnyPrinter` doesn't know what type `T` is. The `clone()` virtual method solves this: the `Model<T>` knows its own type, so it can allocate a new `Model<T>` with a copy of `data` and return it as a `Concept` pointer.

9. `void print() const { pimpl->print(); }`
   The public non-virtual method of the wrapper. It simply forwards the call to the virtual method of the internal `Concept`, triggering dynamic dispatch.

### CS Lens

This is the **Concept-Model Idiom**, formulated by Sean Parent. It achieves **Runtime Duck Typing**. In purely statically typed languages, polymorphism usually requires named interfaces and inheritance. The Concept-Model idiom builds a bridge: it uses templates to capture the type at compile-time, and virtual dispatch to invoke behavior at runtime, effectively decoupling the polymorphic behavior from the inheritance hierarchy.

Also recognized in:
- Swift's `any Protocol` existentials.
- Rust's `dyn Trait` objects.
- Go's interfaces, which are implicitly satisfied without explicit inheritance.

### SE Lens

**The tradeoff:** We have traded structural coupling (intrusive inheritance) for performance overhead (heap allocation and dynamic dispatch). 

By using `std::make_unique`, every time we create an `AnyPrinter`, we are allocating memory on the heap. If we store 10,000 small integers in `AnyPrinters`, we incur 10,000 heap allocations, severely fragmenting memory and causing cache misses. Production type-erased wrappers (like `std::function` and `std::any`) use **Small Buffer Optimization (SBO)**: they pre-allocate a small raw byte array inside the wrapper itself, and use placement-`new` to construct small models directly in that local buffer, falling back to the heap only for large objects.

### Commands needed to make this unit real

No special commands are needed beyond the compiler invocation below.

### Run it

```bash
g++ -std=c++17 main.cpp -o main
./main
```

**Output:**
```
42
Hello Type Erasure
3.14159
```

This unit proves that we can store unrelated types in a single homogeneous vector and invoke a common interface on them, purely by wrapping them in a class that internalizes the polymorphism.

### Connection

We now have a working wrapper that erases type for a specific behavior (`print`), which directly parallels how the C++ standard library solves the problem of storing generic callbacks.

---

## Concept Unit: `std::function` as Type Erasure

### The Problem

If you want to store a callback, what type is it? It could be a free function pointer, a member function bound with `std::bind`, a hand-written functor class, or a lambda expression (which is an anonymous class with a unique, unnameable type generated by the compiler). You cannot use a template parameter if you need to store these various callables in a single collection, or if you are defining an ABI/API boundary where the type must be concrete.

### Isolate the Concept

Here is how `std::function` uses the exact Concept-Model pattern we just built, specialized for the `operator()` capability.

```cpp
#include <iostream>
#include <functional>
#include <vector>

void freeFunction() {
    std::cout << "Free function\n";
}

struct Functor {
    void operator()() const {
        std::cout << "Functor\n";
    }
};

int main() {
    // A single vector holding wildly different underlying types.
    std::vector<std::function<void()>> callbacks;

    callbacks.push_back(freeFunction);                 // Function pointer
    callbacks.push_back(Functor());                    // Functor class
    
    int capture = 42;
    callbacks.push_back([capture]() {                  // Lambda with state
        std::cout << "Lambda capturing " << capture << '\n';
    });

    for (const auto& cb : callbacks) {
        cb();
    }
    
    return 0;
}
```

**Output:**
```
Free function
Functor
Lambda capturing 42
```

This proves that `std::function` erases the concrete type of the callable, preserving only the signature (`void()` in this case). 

### Discard the throwaway example

This example demonstrates the usage; we will discard it and examine the mechanics.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None (conceptual walkthrough of standard library).
- **Change type:** None.
- **Location:** N/A.
- **Dependencies:** `<functional>`

### The New Code

No new code to type; this unit analyzes the standard library's implementation.

### The Updated Project

N/A — conceptual exploration of the STL.

### Mechanical Walkthrough

If we were to map `std::function` onto our `AnyPrinter` pattern:

1. **The Wrapper:** `std::function<void()>` is the non-templated boundary type (it is templated on the *signature*, but not on the *concrete callable type*).
2. **The Concept:** Instead of `virtual void print() = 0`, the internal abstract base class has `virtual void operator()() = 0`.
3. **The Model:** The templated derived class stores the actual lambda, function pointer, or functor, and implements `operator()` by calling the stored object's `operator()`.
4. **The Constructor:** When you pass a lambda to `std::function`, the templated constructor instantiates a `Model<LambdaType>`, allocates it, and stores the base pointer.

### CS Lens

This is **Type Erasure applied to Behavior**. `std::function` is a polymorphic wrapper for callables. It is the C++ equivalent of a generic function delegate. 

Also recognized in: C# `delegate`, Java `Runnable` and `Callable`.

### SE Lens

**The cost of flexibility:** `std::function` is not zero-cost. Invoking a `std::function` requires navigating the internal `Concept` pointer and making a virtual function call, preventing the compiler from inlining the callable in many cases. Furthermore, if the lambda captures a lot of state, the `Model` will be large, and `std::function` will be forced to allocate it on the heap. If you have a performance-critical tight loop, passing a templated `Callable` directly is much faster than passing a `std::function`.

### Commands needed to make this unit real

None.

### Run it

None.

### Connection

While `std::function` uses type erasure for behavior, C++ provides other standard wrappers that use it purely for heterogeneous data storage.

---

## Concept Unit: `std::any` and `std::variant`

### The Problem

Sometimes you don't even need a shared behavior like `print()` or `operator()`. You just need a completely untyped container — a "bucket" that can hold literally anything, and you'll figure out what it is later. Or, conversely, you need a container that can hold different types, but only a strictly known, limited set of them, and you want the compiler to enforce type safety.

### Isolate the Concept

C++17 provides two standard tools for heterogeneous storage that address opposite ends of the safety spectrum.

```cpp
#include <iostream>
#include <any>
#include <variant>
#include <string>

int main() {
    // std::any: The ultimate type erasure. Can hold ANYTHING.
    std::any a = 42;
    a = std::string("Now I am a string");
    
    // You must know the type to get it out. If you guess wrong, it throws std::bad_any_cast.
    std::cout << std::any_cast<std::string>(a) << '\n';

    // std::variant: A type-safe union. A closed set of types.
    std::variant<int, std::string, double> v = 42;
    v = std::string("Also a string");
    
    // You can access it by type...
    std::cout << std::get<std::string>(v) << '\n';
    
    // ...or by index.
    std::cout << std::get<1>(v) << '\n';

    return 0;
}
```

**Output:**
```
Now I am a string
Also a string
Also a string
```

This proves the difference: `std::any` erases the type entirely, leaving you with a blind box. `std::variant` retains the exact type information as a tagged index within a fixed list.

### Discard the throwaway example

This example is discarded; these types are tools to be chosen based on architectural needs.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None.
- **Change type:** None.
- **Location:** N/A.
- **Dependencies:** `<any>`, `<variant>`

### The New Code

No new code to type.

### The Updated Project

N/A

### Mechanical Walkthrough

1. `std::any a = 42;`
   `std::any` uses the exact same Concept-Model type erasure pattern we built. Its `Concept` interface has no `print()` or `operator()`; it only has `clone()`, a destructor, and `type_info()`. It exists solely to manage the lifecycle of an unknown type.

2. `std::any_cast<std::string>(a)`
   Because `std::any` erases the type, the compiler cannot enforce safety. You must perform a runtime check. The internal `Model` stores its `std::type_info`. `any_cast` compares the requested type against the stored type info; if they match, it returns the data. If not, it throws.

3. `std::variant<int, std::string, double> v = 42;`
   `std::variant` **does not use type erasure**. It is a tagged union. Its size is the size of its largest alternative type, plus a small integer tag to remember which type is currently active.

4. `std::get<std::string>(v)`
   This checks the tag at runtime. If the tag says the active type is the string (index 1), it reads the memory as a string. If the tag says it's an `int`, it throws `std::bad_variant_access`.

### CS Lens

`std::variant` is a **Sum Type** (or Tagged Union) from algebraic data types. It represents `A OR B OR C`. `std::any` is the C++ equivalent of `Object` in Java or C#, or `interface{}` in Go — a top-type that bypasses static typing.

Also recognized in: Rust `enum` variants, Haskell `data` definitions.

### SE Lens

**The choice:** 
- If the set of types is open (you want users to pass in their own types you've never seen), and they share a behavior, use **Concept-Model Type Erasure** (like our `AnyPrinter` or `std::function`).
- If the set of types is open, but they share NO behavior and you just need generic storage, use `std::any`. Avoid this unless absolutely necessary, as it defeats static typing entirely.
- If the set of types is closed (you know it will only ever be an `int`, a `float`, or a `string`), use `std::variant`. It requires no heap allocation, no virtual dispatch, and the compiler can exhaustively check that you handled every case.

### Commands needed to make this unit real

None.

### Run it

None.

### Connection

We have seen the full spectrum of type flexibility in C++, from completely opaque erased types to strictly typed, closed sets.

---

## Connect the Pieces

We observed the problem of classical polymorphism: intrusive inheritance prevents the use of built-in or third-party types in polymorphic collections. We built a custom type-erased wrapper (`AnyPrinter`) using the Concept-Model idiom, transferring the templated type knowledge into a private, heap-allocated virtual derived class. We then mapped this exact pattern onto the standard library's `std::function` (behavioral type erasure) and `std::any` (storage type erasure), and contrasted it with `std::variant` (tagged unions).

## What breaks without this

If we delete the `clone()` method from `AnyPrinter::Concept` and `AnyPrinter::Model`, our wrapper becomes uncopyable. We would only be able to move `AnyPrinter` instances. Attempting to pass `AnyPrinter` by value, or returning it from a function without moving it, would result in a compiler error about a deleted copy constructor. Type erasure forces you to explicitly define how lifecycle operations (copying, destroying) bridge the virtual boundary.

## Exercises

1. **Add a behavior:** Modify `AnyPrinter` to become `AnyDrawable`. Add a `draw()` method to the Concept, Model, and Wrapper.
2. **Implement `std::any`:** Create a simplified `MyAny` class that has no `print()` method, but provides a `type_info()` method returning the `std::type_info` of the stored type, mimicking how `std::any_cast` checks types.

## Definition of Done

- [x] A type-erased wrapper class is built using the Concept-Model idiom.
- [x] Unrelated types (int, string) are successfully stored in a homogeneous vector.
- [x] The architecture of `std::function`, `std::any`, and `std::variant` is understood in relation to type erasure.

```bash
git add main.cpp
git commit -m "Implement Concept-Model type erasure to hold unrelated types without inheritance"
```
