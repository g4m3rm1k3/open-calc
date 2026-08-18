# Lesson 06: The Factory Pattern

We will build a set of cross-platform UI controls (buttons, checkboxes), but instead of calling their constructors directly scattered throughout the code, we will build a dedicated system to decide which specific type of UI control to create. The transferable problem this solves is separating the decision of *which* concrete class to instantiate from the code that actually *uses* the instantiated object, allowing the system to grow without modifying existing code.

**What you need to know first:**
- C++ From Scratch (smart pointers, move semantics, inheritance).

**Terms used in this lesson:**
- **The Factory Pattern** — a creational design pattern that delegates the responsibility of instantiating objects to a dedicated method or class. This exists to solve the problem of tightly coupling business logic to concrete classes when the logic only needs to know about their base interfaces.
- **Abstract Factory** — a variation of the Factory pattern that groups the creation of related families of objects together behind a single interface. This exists to solve the problem of ensuring that a system only creates objects that are conceptually compatible with each other, preventing mismatched pieces.
- **Polymorphism** — the ability of different concrete classes to be treated as instances of the same base class through pointers or references. This exists to solve the problem of having to write duplicate code for every single specific type in a system.

**Objects and methods used:**
- **`std::unique_ptr<T>`**
  - *What it is:* A standard library smart pointer that retains sole ownership of an object and automatically destroys it when the pointer goes out of scope.
  - *Implementation:* `std::unique_ptr<Base> ptr = std::make_unique<Derived>();`
  - *Its use:* Returned by our factories to ensure the caller immediately assumes safe ownership of the newly created object on the heap, structurally preventing memory leaks.
- **`std::make_unique<T>()`**
  - *What it is:* A standard library template function that safely allocates an object of type `T` on the heap and wraps it in a `std::unique_ptr`.
  - *Implementation:* `std::make_unique<Derived>(args...)`
  - *Its use:* Called inside our factories to perform the actual allocation and return the result in one exception-safe step.

---

## Concept Unit: The Static Factory Method

### The Problem

A caller needs to create an object, but deciding *which* exact subclass to instantiate depends on runtime data (like a configuration string, user input, or an enum). If the caller evaluates this data and calls `new WindowsButton()` or `new MacButton()` directly, it becomes permanently coupled to every single subclass. Every time a new platform is added, the caller's code has to be modified.

### Introduce the concept in isolation

This is called a **static factory method**. It is a single static function that takes some criteria, decides which concrete class to build, and returns it as a base class pointer.

```cpp
#include <iostream>
#include <memory>
#include <string>

struct Animal {
    virtual ~Animal() = default;
    virtual void speak() = 0;
};

struct Dog : Animal { void speak() override { std::cout << "Woof\n"; } };
struct Cat : Animal { void speak() override { std::cout << "Meow\n"; } };

class AnimalFactory {
public:
    static std::unique_ptr<Animal> createAnimal(const std::string& type) {
        if (type == "dog") return std::make_unique<Dog>();
        if (type == "cat") return std::make_unique<Cat>();
        return nullptr;
    }
};

int main() {
    auto pet = AnimalFactory::createAnimal("dog");
    if (pet) pet->speak();
    return 0;
}
```

**Run and Output:**
```
Woof
```

This output proves that `main` successfully obtained and used a `Dog` instance without ever naming the `Dog` class directly. The factory entirely owned the decision.

### Discard the throwaway example

The animal example is discarded and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating design patterns directly.
- **Files affected:** `src/main.cpp` (created)
- **Change type:** Add
- **Dependencies:** None

### The New Code

```cpp
#include <iostream>
#include <memory>
#include <string>

struct Button {
    virtual ~Button() = default;
    virtual void render() = 0;
};

struct WindowsButton : Button {
    void render() override { std::cout << "[Windows Button]\n"; }
};

struct MacButton : Button {
    void render() override { std::cout << "(Mac Button)\n"; }
};

class ButtonFactory {
public:
    static std::unique_ptr<Button> createButton(const std::string& os) {
        if (os == "Windows") {
            return std::make_unique<WindowsButton>();
        } else if (os == "Mac") {
            return std::make_unique<MacButton>();
        }
        return nullptr;
    }
};
```

### The Updated Project

```cpp
// ... existing Button, WindowsButton, MacButton, ButtonFactory ...

int main() {
    std::string currentOS = "Mac"; // Simulated runtime data
    
    // ← new
    std::unique_ptr<Button> myButton = ButtonFactory::createButton(currentOS);
    
    if (myButton) {
        myButton->render();
    }
    
    return 0;
}
```
The `main` function simulates reading the environment, delegates the creation to the factory, and then uses the resulting object purely through its abstract interface.

### Mechanical walkthrough

- `struct Button { ... }` — Defines the base interface. This is what the rest of the application will depend on, completely insulating it from concrete types.
- `virtual ~Button() = default;` — A virtual destructor. This is mandatory for polymorphic base classes in C++ to ensure that when a `std::unique_ptr<Button>` is destroyed, the derived class's destructor correctly runs.
- `virtual void render() = 0;` — A pure virtual function making `Button` an abstract class. It forces all derived classes to provide their own implementation.
- `struct WindowsButton : Button { ... }` — A concrete derived class that implements the specific behavior for Windows.
- `class ButtonFactory { ... }` — The factory class acting as the single namespace for creation logic.
- `static std::unique_ptr<Button> createButton(...)` — The static factory method. By returning a `std::unique_ptr`, the factory enforces that the caller must assume exclusive ownership of the allocated memory, eliminating the possibility of a forgotten `delete`.
- `if (os == "Windows") { ... }` — The conditional logic where the factory assumes the burden of knowing about every concrete subclass so the caller doesn't have to.
- `return std::make_unique<WindowsButton>();` — Performs the heap allocation and wraps it. Because `WindowsButton` inherits from `Button`, this seamlessly converts into the `std::unique_ptr<Button>` return type.
- `auto myButton = ButtonFactory::createButton(currentOS);` — The caller invokes the factory without needing to `#include` the concrete button headers (in a real multi-file project).
- `myButton->render();` — Dynamic dispatch. The compiler doesn't know this is a `MacButton`; it resolves to the correct method at runtime.

### CS Lens

This is the **Factory Pattern**. 
Also recognized in: DOM element creation (`document.createElement`), logger instantiation based on config files, parsers generating specific AST nodes from generic tokens.

### SE Lens

This isolates the volatility of instantiation. Adding a `LinuxButton` requires modifying the factory, but requires zero changes to the calling code. This is an application of the Open/Closed Principle: the application logic is closed for modification, but open for extension. Returning `std::unique_ptr` engineers safety directly into the API signature.

### Commands needed to make this unit real

Compile the file:
```bash
g++ -std=c++17 src/main.cpp -o factory_demo
```
- `g++`: The GNU C++ compiler.
- `-std=c++17`: Tells the compiler to use the C++17 language standard.
- `src/main.cpp`: The source file to compile.
- `-o factory_demo`: Sets the name of the output executable.

### Run it. Show the real output

```bash
./factory_demo
(Mac Button)
```

### Connection

A static factory method works well when we only need one type of object at a time. But what if a platform requires a whole suite of objects—buttons, checkboxes, and sliders—and we must guarantee they all match?

---

## Concept Unit: The Abstract Factory

### The Problem

We need to create multiple related objects, but they must match a specific family or theme. A static factory for each individual type (a `ButtonFactory`, a `CheckboxFactory`) would require the caller to pass the "OS" string every single time. Worse, a bug could accidentally request a Mac button and a Windows checkbox in the same window, breaking the visual consistency.

### Introduce the concept in isolation

This is called an **Abstract Factory**. Instead of a static method, we create an entirely separate object whose sole job is to implement an interface that groups the creation of an entire family of objects.

```cpp
#include <iostream>
#include <memory>

struct ThemeFont { virtual void display() = 0; virtual ~ThemeFont() = default; };
struct DarkFont : ThemeFont { void display() override { std::cout << "White Text\n"; } };
struct LightFont : ThemeFont { void display() override { std::cout << "Black Text\n"; } };

struct ThemeFactory {
    virtual std::unique_ptr<ThemeFont> createFont() = 0;
    virtual ~ThemeFactory() = default;
};

struct DarkThemeFactory : ThemeFactory {
    std::unique_ptr<ThemeFont> createFont() override { return std::make_unique<DarkFont>(); }
};

int main() {
    std::unique_ptr<ThemeFactory> factory = std::make_unique<DarkThemeFactory>();
    auto font = factory->createFont();
    font->display();
    return 0;
}
```

**Run and Output:**
```
White Text
```

This output proves that by passing around a factory instance, the system locks in the "Dark" decision once, and all subsequent objects created from it are guaranteed to match that theme.

### Discard the throwaway example

The theme example is discarded and will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/main.cpp`
- **Change type:** Add
- **Location:** Below the existing `Button` definitions.

### The New Code

```cpp
struct Checkbox {
    virtual ~Checkbox() = default;
    virtual void paint() = 0;
};

struct WindowsCheckbox : Checkbox {
    void paint() override { std::cout << "[x] Windows Checkbox\n"; }
};

struct MacCheckbox : Checkbox {
    void paint() override { std::cout << "(v) Mac Checkbox\n"; }
};

struct GUIFactory {
    virtual ~GUIFactory() = default;
    virtual std::unique_ptr<Button> createButton() = 0;
    virtual std::unique_ptr<Checkbox> createCheckbox() = 0;
};

struct WindowsFactory : GUIFactory {
    std::unique_ptr<Button> createButton() override {
        return std::make_unique<WindowsButton>();
    }
    std::unique_ptr<Checkbox> createCheckbox() override {
        return std::make_unique<WindowsCheckbox>();
    }
};

struct MacFactory : GUIFactory {
    std::unique_ptr<Button> createButton() override {
        return std::make_unique<MacButton>();
    }
    std::unique_ptr<Checkbox> createCheckbox() override {
        return std::make_unique<MacCheckbox>();
    }
};
```

### The Updated Project

```cpp
void buildUI(GUIFactory& factory) {
    auto button = factory.createButton();
    auto checkbox = factory.createCheckbox();
    
    button->render();
    checkbox->paint();
}

int main() {
    std::string config = "Windows";
    std::unique_ptr<GUIFactory> factory;
    
    if (config == "Windows") {
        factory = std::make_unique<WindowsFactory>();
    } else {
        factory = std::make_unique<MacFactory>();
    }
    
    // ← new
    buildUI(*factory);
    
    return 0;
}
```
The `buildUI` function receives a factory reference and uses it to construct a cohesive set of widgets without knowing or caring what platform it is running on.

### Mechanical walkthrough

- `struct Checkbox { ... }` — The abstract base for the second product family.
- `struct GUIFactory { ... }` — The abstract factory interface. It declares a creation method for every type of product in the family.
- `virtual std::unique_ptr<Button> createButton() = 0;` — The factory method signature inside the abstract factory. Notice it takes no arguments: the context (the OS) is already captured by the concrete factory's type.
- `struct WindowsFactory : GUIFactory { ... }` — A concrete factory that guarantees all created objects belong to the Windows family.
- `void buildUI(GUIFactory& factory)` — The consumer code. It takes the factory by reference, meaning the caller owns the factory, and `buildUI` just uses it. This is **Dependency Injection**: the decision-maker is passed in rather than hardcoded.
- `auto button = factory.createButton();` — The consumer asks for a button. It is mathematically impossible for this to return a Mac button if a `WindowsFactory` was provided.
- `std::unique_ptr<GUIFactory> factory;` — In `main`, the application resolves the configuration once, at startup, and instantiates the correct factory.
- `buildUI(*factory);` — Dereferences the smart pointer to pass the factory polymorphic-ally by reference into the UI builder.

### CS Lens

This is the **Abstract Factory**.
Also recognized in: Cross-platform UI toolkits (Qt, wxWidgets), rendering engines (DirectX vs OpenGL pipelines), database drivers (a SQL factory producing connections, statements, and result sets that match the engine).

### SE Lens

This pattern guarantees the creation of dependent objects. By forcing the caller to rely on a single factory instance, the system engineers away the failure mode of mismatched objects. The tradeoff is rigidity: adding a new product (like a `Slider`) requires modifying the base `GUIFactory` interface and every single concrete factory implementation.

### Commands needed to make this unit real

Compile again using the exact same command:
```bash
g++ -std=c++17 src/main.cpp -o factory_demo
```

### Run it. Show the real output

```bash
./factory_demo
[Windows Button]
[x] Windows Checkbox
```

### Connection

We started by hiding a single instantiation behind a static method, and elevated that into passing an object whose sole runtime purpose is instantiating entire suites of compatible types.

---

## Closing

By defining `buildUI` to rely purely on `GUIFactory`, `Button`, and `Checkbox`, we have completely decoupled our rendering logic from the concrete implementation of the operating system.

**Connect the pieces:**
1. `main` reads `config = "Windows"` and instantiates a `WindowsFactory`.
2. `buildUI` takes this factory and calls `createCheckbox()`.
3. The `WindowsFactory` implementation of `createCheckbox` executes, allocating a `WindowsCheckbox` on the heap via `std::make_unique` and returning it.
4. `buildUI` calls `paint()` on the returned abstract pointer, which dynamically dispatches to `WindowsCheckbox::paint()`, outputting `[x] Windows Checkbox`.
5. `buildUI` finishes, the `std::unique_ptr`s go out of scope, and the button and checkbox are safely destroyed.

**What breaks without this:**
If we returned a raw pointer `Button*` from the factory instead of `std::unique_ptr<Button>`, the caller `buildUI` would be responsible for calling `delete button;`. If an early `return` or exception occurred between creation and deletion, the application would leak memory. 

**Exercises:**
- Add a third product family: `LinuxFactory`, `LinuxButton`, and `LinuxCheckbox`. Note how `buildUI` requires absolutely zero modifications to support the new OS.
- Add a new product type, `Slider`, to the `GUIFactory` interface, and implement it across all existing concrete factories.

**Definition of done:**
- [x] A static factory method for single-object decoupling.
- [x] An abstract factory interface and concrete implementations for family decoupling.
- [x] Strict adherence to C++ ownership semantics using `std::unique_ptr`.
- [x] Commit: `git commit -m "Implement Abstract Factory pattern for cross-platform UI generation"`
