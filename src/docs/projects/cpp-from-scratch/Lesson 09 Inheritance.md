# Lesson 09: Inheritance

**What you will build:** You will build a set of related object types that share common structure but have distinct, specialized behaviors. By proving that a program can issue uniform commands to different types through a shared ancestor, you will learn how to write generalized code that automatically adapts to the specific type of object it receives at runtime, and understand the low-level mechanism (the vtable) C++ uses to achieve this without complex if/else checks.

**What you need to know first:** Lesson 06 Classes and Objects.

**Terms introduced in this lesson:**
- **Inheritance** — a mechanism where a new class acquires the members and functions of an existing class. *Why it exists:* to eliminate redundant code by defining shared logic in one place.
- **Base class** — the class being inherited from. *Why it exists:* to serve as a common template or contract for specialized classes.
- **Derived class** — the class that inherits from a base class. *Why it exists:* to add specific features or override behaviors while keeping the shared foundation.
- **Polymorphism** — the ability of different objects to respond in their own unique way to the same method call through a shared pointer or reference. *Why it exists:* to allow calling code to remain ignorant of an object's exact type.
- **Abstract class** — a class that cannot be instantiated directly, serving only as a base for other classes. *Why it exists:* to represent a pure concept that only makes sense when fully specialized.
- **vtable (virtual method table)** — a hidden array of function pointers created by the compiler for polymorphic classes. *Why it exists:* to look up and execute the correct overridden function at runtime when the exact object type isn't known at compile time.

**Objects and methods used:**
- **`: public BaseClass`**
  - *What it is:* The syntax declaring inheritance.
  - *Implementation:* `class Dog : public Animal`
  - *Its use:* Establishing an "is-a" relationship and inheriting the public interface of the base class.
- **`virtual`**
  - *What it is:* A keyword indicating that a function can be overridden by a derived class and should use dynamic dispatch.
  - *Implementation:* `virtual void make_sound()`
  - *Its use:* Instructing the compiler to create a vtable entry for this function so the correct version is called at runtime.
- **`override`**
  - *What it is:* A specifier telling the compiler that a function is intended to replace an inherited `virtual` function.
  - *Implementation:* `void make_sound() override`
  - *Its use:* Catching errors at compile time if the base class function signature doesn't match or doesn't exist.
- **`= 0` (Pure virtual specifier)**
  - *What it is:* Syntax indicating a virtual function has no implementation in the base class.
  - *Implementation:* `virtual void make_sound() = 0;`
  - *Its use:* Forcing derived classes to provide their own implementation, thereby making the base class abstract.

---

## Concept Unit: Inheritance

### The Problem
When modeling concepts that share many attributes but differ slightly, you often end up copying and pasting properties and methods across multiple classes. This duplication means that fixing a bug in shared logic requires updating every single copy. You need a way to define common logic once and share it automatically.

### The New Code
```cpp
#include <iostream>

class Animal {
public:
    void eat() {
        std::cout << "Consuming food.\n";
    }
};

class Dog : public Animal {
    // Dog inherits eat() automatically
};

int main() {
    Animal my_animal;
    my_animal.eat();

    Dog my_dog;
    my_dog.eat();

    return 0;
}
```

### Mechanical Walkthrough
- `class Animal` defines a base class with a public method `eat()`. This encapsulates logic that any animal should possess.
- `class Dog : public Animal` defines a new class named `Dog` that inherits from `Animal`. The `:` symbol denotes this inheritance relationship, and `public` dictates that public members of `Animal` remain public in `Dog`. Because of this, `Dog` automatically possesses the `eat()` method even though its block is empty.
- `my_dog.eat();` executes the inherited method. Even though `eat()` is not explicitly written inside the `Dog` class, the compiler resolves the call to the base `Animal` class's function.

### CS Lens
This is subtyping. It establishes an "is-a" relationship (`Dog` is an `Animal`). In systems architecture, hierarchical classifications allow broad rules to be applied to categories of entities rather than individuals, much like how file systems treat both files and directories as "nodes" with a common set of metadata.

### SE Lens
Inheritance provides code reuse. The alternative is composition, where a `Dog` would contain an `Animal` instance and manually forward calls to it. While composition is often safer for complex systems (avoiding deep, rigid hierarchies), inheritance is the most direct way to establish a shared structural baseline when the "is-a" relationship is mathematically strict.

### Run It Yourself
1. Open a terminal.
2. Create a file named `inheritance.cpp` and paste the code above.
3. Compile with: `g++ -std=c++17 inheritance.cpp -o app`
4. Run: `./app` (or `app.exe` on Windows).
5. Observe the exact output:
   ```
   Consuming food.
   Consuming food.
   ```

---

## Concept Unit: virtual, override, and the vtable

### The Problem
Inheritance provides shared logic, but not all derived types should behave exactly like the base type. Furthermore, if you handle a derived object using a pointer to its base class, the compiler normally binds function calls based on the pointer's type, not the actual object's type. You need a way to instruct the runtime to look up the correct specialized function based on the exact object in memory.

### The New Code
```cpp
#include <iostream>

class Animal {
public:
    virtual void make_sound() {
        std::cout << "Generic animal noise\n";
    }
};

class Dog : public Animal {
public:
    void make_sound() override {
        std::cout << "Bark\n";
    }
};

int main() {
    Animal generic;
    Animal* p1 = &generic;
    p1->make_sound();

    Dog fido;
    Animal* p2 = &fido;
    p2->make_sound();

    return 0;
}
```

### Mechanical Walkthrough
- `virtual void make_sound()` on `Animal` marks the method as overridable and enables dynamic dispatch. The `virtual` keyword explicitly tells the compiler: "When someone calls this through a pointer, don't just assume the `Animal` version; check the object's hidden vtable at runtime to find the right version."
- `void make_sound() override` on `Dog` replaces the base implementation. The `override` keyword tells the compiler to swap out the `Animal` version of `make_sound()` for this specific `Dog` version. If `make_sound()` wasn't virtual in the base class, the `override` keyword would trigger a compile-time error.
- `Animal* p2 = &fido;` creates a pointer of type `Animal*` but points it to a `Dog` object. This is a valid upcast because a `Dog` is an `Animal`.
- `p2->make_sound();` invokes the function. Because `make_sound` is `virtual`, the program dereferences a hidden pointer inside the `fido` object, finds the vtable for `Dog`, and calls `Dog::make_sound()`, returning "Bark".

### CS Lens
This is dynamic dispatch powered by a virtual method table (vtable). When a class contains at least one `virtual` function, the compiler silently adds a hidden pointer (often called `vptr`) to every instantiated object of that class. This pointer points to a static array of function pointers (the vtable) specific to that exact class. At runtime, a virtual function call performs an indirect jump using this table, which is slightly slower than a regular static function call but provides polymorphism.

### SE Lens
The Open/Closed Principle. The `Animal` class is closed for modification but open for extension. The calling code dealing with `Animal*` pointers doesn't need a massive `switch` statement checking types (e.g., `if (type == DOG) bark();`). You can create a `Cat` class tomorrow, and the existing pointer logic will correctly route calls to `meow()` without needing recompilation.

### Run It Yourself
1. Replace the contents of `inheritance.cpp` with the code above.
2. Compile: `g++ -std=c++17 inheritance.cpp -o app`
3. Run: `./app`
4. Observe the exact output:
   ```
   Generic animal noise
   Bark
   ```

---

## Concept Unit: Pure Virtual Functions and Abstract Classes

### The Problem
Sometimes a base class represents a concept so generic that providing a default implementation makes no sense. An `Animal` might need to make a sound, but there is no such thing as a "generic animal noise" in reality. You need a way to force every derived class to write its own implementation, while preventing anyone from instantiating the meaningless base class directly.

### The New Code
```cpp
#include <iostream>
#include <vector>

class Animal {
public:
    virtual void make_sound() = 0; // Pure virtual function
};

class Dog : public Animal {
public:
    void make_sound() override {
        std::cout << "Bark\n";
    }
};

class Cat : public Animal {
public:
    void make_sound() override {
        std::cout << "Meow\n";
    }
};

int main() {
    // Animal a; // This would cause a compile error
    
    std::vector<Animal*> pets;
    
    Dog fido;
    Cat whiskers;
    
    pets.push_back(&fido);
    pets.push_back(&whiskers);
    
    for (Animal* pet : pets) {
        pet->make_sound();
    }

    return 0;
}
```

### Mechanical Walkthrough
- `virtual void make_sound() = 0;` declares a pure virtual function. The `= 0` syntax tells the compiler that this function has no body in `Animal`.
- Because `Animal` has at least one pure virtual function, it becomes an abstract class. The compiler will absolutely forbid `Animal a;` (instantiation).
- `class Dog` and `class Cat` provide concrete implementations using `override`. If they failed to implement `make_sound()`, they would also be considered abstract classes and could not be instantiated.
- `std::vector<Animal*> pets;` creates a collection capable of holding pointers to any class derived from `Animal`.
- `for (Animal* pet : pets)` loops over the mixed collection. The uniform command `pet->make_sound()` triggers unique behaviors ("Bark", "Meow") via the vtable, perfectly demonstrating polymorphism.

### CS Lens
This defines an interface. In C++, there is no separate `interface` keyword; an interface is simply an abstract class consisting entirely of pure virtual functions. This maps directly to hardware device drivers: an operating system dictates an interface "SendPacket = 0", and the specific Realtek or Intel driver must provide the exact hardware instructions.

### SE Lens
This establishes a strict contract. The base class dictates *what* must be done, and the derived classes dictate *how*. This decouples the caller (the loop) from the implementer (`Dog`, `Cat`). The loop code relies solely on the contract and does not know or care that `Cat` and `Dog` exist.

### Run It Yourself
1. Replace the contents of `inheritance.cpp` with the code above.
2. Compile: `g++ -std=c++17 inheritance.cpp -o app`
3. Run: `./app`
4. Observe the exact output:
   ```
   Bark
   Meow
   ```

---

## Connect the Pieces
Consider a graphics engine. A base `UIElement` abstract class defines a pure virtual `void render() = 0;`. It dictates the contract for anything drawn to the screen. A derived `Button` class inherits `UIElement` and provides a concrete `render()` implementation containing math for drawing rectangles and text. A `Slider` class does the same for a track and thumb. The engine's main loop holds a `std::vector<UIElement*>`. It iterates over this array, calling `element->render()` on each pointer. Polymorphism and the hidden vtables ensure the `Button` draws a button and the `Slider` draws a slider, all initiated from a single, simple loop that never performs a single type check.

## What Breaks Without This
Without the `virtual` keyword, pointers to base classes use static dispatch based solely on the pointer type, breaking polymorphism completely.

Create or edit `static_dispatch.cpp`:
```cpp
#include <iostream>

class Animal {
public:
    void make_sound() { // Missing 'virtual'
        std::cout << "Generic\n";
    }
};

class Dog : public Animal {
public:
    void make_sound() {
        std::cout << "Bark\n";
    }
};

int main() {
    Dog my_dog;
    Animal* ptr = &my_dog;
    ptr->make_sound(); // We expect "Bark"
    
    return 0;
}
```
Run it. The output is `Generic`. Even though the object in memory is a `Dog`, because `Animal::make_sound()` was not `virtual`, the compiler statically linked the call based on the pointer's type (`Animal*`). The runtime vtable lookup was bypassed entirely. To fix this, add `virtual` to the base method, forcing dynamic dispatch.

## Exercises
1. **The Shape Hierarchy**: Create an abstract base class `Shape` with a pure virtual function `virtual double area() = 0;`. Create a `Square` subclass (with a `side` member) that overrides `area()` to return `side * side`, and a `Rectangle` subclass (with `width` and `height`) returning `width * height`. Create a `std::vector<Shape*>` containing instances of both, and loop to print their areas.
2. **Missing Implementation**: Try to instantiate a `Square` but deliberately comment out its `area()` override. Observe the precise compiler error C++ gives you when attempting to instantiate an abstract class.
3. **The `override` Safety Net**: In `Dog`, change the signature of your override to `void make_sound(int volume) override`. Observe the compiler error proving that `override` caught your mismatch with the base class signature.

## Definition of Done
- [ ] You have run every code example and verified the outputs.
- [ ] You have seen the compiler error when failing to implement a pure virtual function, or when mismatched signatures use `override`.
- [ ] You understand the difference between compile-time type (the pointer declaration) and run-time type (the instantiated object in memory).
- [ ] You can explain the role of the vtable and why `virtual` is required to make polymorphism work in C++.
- [ ] You can explain Inheritance and Polymorphism out loud, in your own words, to someone who hasn't read this lesson.
