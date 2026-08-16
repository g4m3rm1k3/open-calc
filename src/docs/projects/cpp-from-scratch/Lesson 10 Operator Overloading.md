# Lesson 10: Operator Overloading

**What you will build:** You will build a sequence of isolated classes that redefine how standard C++ operators behave. You will prove that C++ allows custom objects to be added, compared, and printed just like built-in integers, and you will learn the rules for managing object memory safely when assigning one object to another. Every code example in this lesson proves one concept, then is explicitly discarded. It never becomes part of a project.

**What you need to know first:** Lesson 06 Classes and Objects, Lesson 07 Constructors and Destructors.

**Terms introduced in this lesson:**
- **Operator Overloading** — redefining how standard C++ operators (like `+`, `==`) work for custom classes. *Why it exists:* To make custom types feel like built-in types, allowing natural mathematical and logical expressions without forcing the use of clunky methods like `add()`.
- **Friend Function** — a function declared with the `friend` keyword that is not a member of a class but is granted full access to its private members. *Why it exists:* To allow external functions (like the `<<` stream insertion operator) to read private data without exposing that data publicly via getters.
- **Copy Assignment Operator** — a special operator (`=`) that is automatically called when an already-initialized object is assigned the value of another existing object of the same type. *Why it exists:* To control how resources (like dynamically allocated memory) are cleaned up and duplicated when replacing an object's current state.
- **Rule of Three** — a software engineering rule stating that if a class requires a user-defined destructor, copy constructor, or copy assignment operator, it almost certainly requires all three. *Why it exists:* To prevent resource leaks, double-frees, or shallow-copy bugs when a class manually manages its own memory.

**Objects and methods used:**
- **std::ostream**
  - *What it is:* The base class for output streams, including `std::cout`.
  - *Implementation:* Defined in the `<iostream>` standard library header.
  - *Its use:* Serves as the left-hand operand type when overloading the `<<` operator to print custom objects to the console.

---

## Concept Unit: Overloading the Addition Operator (+)

### The Problem
When you build a custom class representing a mathematical or physical concept (like a 2D vector or a currency amount), adding them together using a method like `v1.add(v2)` is verbose and hard to read. You want to use the standard `+` operator, just like you would with integers (`v1 + v2`).

### The New Code
```cpp
#include <iostream>

class Vector2D {
private:
    int x;
    int y;

public:
    Vector2D(int x, int y) : x(x), y(y) {}

    Vector2D operator+(const Vector2D& other) const {
        return Vector2D(this->x + other.x, this->y + other.y);
    }

    void print() const {
        std::cout << "x: " << x << ", y: " << y << "\n";
    }
};

int main() {
    Vector2D v1(2, 3);
    Vector2D v2(4, 1);
    Vector2D v3 = v1 + v2;
    v3.print();
    return 0;
}
```

### Mechanical Walkthrough
- `Vector2D operator+(const Vector2D& other) const` declares an operator overload. 
- `operator+` is the specific name C++ requires to redefine the `+` symbol. Without this exact name, the compiler will not map the `+` symbol to this function.
- `const Vector2D& other` takes the right-hand side of the `+` expression as a read-only reference. It is passed by reference to avoid copying, and `const` ensures the right-hand object is not modified by the addition.
- `const` at the end of the signature guarantees that the left-hand object (the one the method is called on) is not modified either. Addition should produce a new value, not change the existing ones.
- `return Vector2D(...)` constructs and returns an entirely new `Vector2D` object containing the sum of the components. Without creating a new object, `+` would mutate existing data, behaving like `+=`.
- `v1 + v2` is exactly equivalent to calling `v1.operator+(v2)`. The compiler translates the symbol into the method call.

### CS Lens
This is syntactic sugar. Operator overloading does not give the computer new capabilities; it maps existing method-call mechanics onto established mathematical symbols. This reduces cognitive load when reading complex equations, allowing the programmer to rely on their existing understanding of arithmetic notation.

### SE Lens
The alternative not chosen is writing a `Vector2D add(const Vector2D& other)` method. The tradeoff of operator overloading is potential abuse: redefining `+` to mean something non-obvious (like deleting a file) makes the code actively misleading. Operator overloading should only be used when the operator's mathematical or logical meaning is universally understood for that type.

### Run It Yourself
1. Open a terminal.
2. Save the code in a file named `main.cpp`.
3. Compile with `g++ -std=c++17 main.cpp -o main`.
4. Run `./main` (or `.\main.exe` on Windows).
Expected output:
```text
x: 6, y: 4
```

---

## Concept Unit: Equality and Overloading ==

### The Problem
By default, C++ does not know how to compare two objects of a custom class. If you try to write `v1 == v2`, the compiler will produce an error because it doesn't know which fields matter for equality. You must define what makes two objects "equal."

### The New Code
```cpp
#include <iostream>

class Item {
private:
    int id;

public:
    Item(int id) : id(id) {}

    bool operator==(const Item& other) const {
        return this->id == other.id;
    }
};

int main() {
    Item item1(42);
    Item item2(42);
    Item item3(99);

    if (item1 == item2) {
        std::cout << "item1 and item2 are equal\n";
    }
    if (!(item1 == item3)) {
        std::cout << "item1 and item3 are not equal\n";
    }
    return 0;
}
```

### Mechanical Walkthrough
- `bool operator==(const Item& other) const` defines the equality operator. 
- `bool` is the return type. Equality must answer a true/false question. Without returning a boolean, the result could not be used in an `if` statement.
- `this->id == other.id` explicitly compares the internal state of the left-hand object (`this`) and the right-hand object (`other`). 
- `item1 == item2` triggers the `operator==` method on `item1`, passing `item2` as the argument.

### CS Lens
Equality is a semantic concept, not just a memory comparison. Two objects might reside at different memory addresses but be considered logically equal if their identifying data (like an ID) matches. Overloading `==` allows the class author to define the exact semantic rules for equivalence.

### SE Lens
The alternative not chosen is relying on a manual `isEqual()` method or comparing public fields directly (`item1.getId() == item2.getId()`). Overloading `==` makes the code significantly cleaner when objects are used in standard algorithms, like searching a list for a specific item, which inherently rely on the `==` operator to function.

### Run It Yourself
1. Save the code in `main.cpp`.
2. Compile with `g++ -std=c++17 main.cpp -o main`.
3. Run `./main`.
Expected output:
```text
item1 and item2 are equal
item1 and item3 are not equal
```

---

## Concept Unit: Printing Objects with << and Friend Functions

### The Problem
You want to print your object directly using `std::cout << myObject;`. However, the `<<` operator belongs to the `std::ostream` class (like `std::cout`), not your class. You cannot add a method to the standard library's `std::ostream` class. Furthermore, the function that overloads `<<` needs to read your object's private data to print it.

### The New Code
```cpp
#include <iostream>
#include <string>

class Player {
private:
    std::string name;
    int score;

public:
    Player(std::string name, int score) : name(name), score(score) {}

    friend std::ostream& operator<<(std::ostream& os, const Player& player);
};

std::ostream& operator<<(std::ostream& os, const Player& player) {
    os << "[" << player.name << ": " << player.score << "]";
    return os;
}

int main() {
    Player p1("Zelda", 1500);
    std::cout << "Winner: " << p1 << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `friend std::ostream& operator<<(std::ostream& os, const Player& player);` inside the class declares a friend function. 
- `friend` tells the compiler: "This specific function is not a member of this class, but it is allowed to read and write my private fields." Without this keyword, the external function would be blocked from accessing `name` and `score`.
- `std::ostream& operator<<(...)` is defined outside the class. It takes the output stream (`os`) as the left operand and the `Player` as the right operand.
- `os << "[" << player.name ...` writes the private data into the stream.
- `return os;` returns the stream itself by reference. Without returning the stream, you could not chain multiple output operations together (like `std::cout << p1 << "\n"`).

### CS Lens
The `<<` operator is mathematically left-associative. When you write `cout << a << b`, it evaluates as `(cout << a) << b`. Because `cout << a` returns a reference to `cout`, the result is `cout << b`, allowing the chain to continue indefinitely.

### SE Lens
The alternative not chosen is adding public getter methods for every field just so an external print function can read them. The tradeoff of the `friend` keyword is that it slightly weakens encapsulation by granting a specific outsider full access, but the benefit is keeping the class interface clean of getter methods that exist solely for logging or printing.

### Run It Yourself
1. Save the code in `main.cpp`.
2. Compile with `g++ -std=c++17 main.cpp -o main`.
3. Run `./main`.
Expected output:
```text
Winner: [Zelda: 1500]
```

---

## Concept Unit: The Copy Assignment Operator (=)

### The Problem
When you assign an existing object to another existing object (`a = b`), C++ performs a shallow copy by default, copying the raw bytes of `b` into `a`. If your object manages dynamically allocated memory (using `new`), a shallow copy will result in both objects pointing to the exact same memory address. When one object modifies or deletes the memory, the other object is corrupted.

### The New Code
```cpp
#include <iostream>

class Buffer {
private:
    int* data;

public:
    Buffer(int value) {
        data = new int(value);
    }

    ~Buffer() {
        delete data;
    }

    Buffer& operator=(const Buffer& other) {
        if (this == &other) {
            return *this;
        }
        
        *data = *(other.data);
        return *this;
    }

    void print() const {
        std::cout << "Data: " << *data << "\n";
    }
};

int main() {
    Buffer b1(10);
    Buffer b2(20);
    
    b2 = b1; 
    
    b2.print();
    return 0;
}
```

### Mechanical Walkthrough
- `Buffer& operator=(const Buffer& other)` defines the copy assignment operator. It is called exactly when an existing object receives an assignment.
- `if (this == &other)` checks for self-assignment (e.g., `b1 = b1`). If the memory addresses are identical, the method immediately returns. Without this check, the function might mistakenly overwrite or delete its own data before copying it.
- `*data = *(other.data);` performs a deep copy of the value, rather than copying the pointer address. Both objects retain their own independent memory allocations, but the values inside them are synchronized.
- `return *this;` returns a reference to the newly updated object, enabling chained assignments (like `a = b = c`).

### CS Lens
Assignment is fundamentally different from initialization. A copy constructor creates a brand new object. An assignment operator alters an object that has already been constructed, which means it may hold existing resources (like allocated memory or open files) that must be carefully managed or cleaned up before adopting the new state.

### SE Lens
The alternative not chosen is letting C++ perform a default shallow copy. The tradeoff is that writing custom copy assignment operators is tedious and prone to edge-case bugs (like forgetting the self-assignment check). This is why modern C++ strongly prefers using smart pointers (`std::unique_ptr` or `std::shared_ptr`) which automatically handle memory duplication and cleanup, entirely removing the need to write custom assignment operators in most cases.

### Run It Yourself
1. Save the code in `main.cpp`.
2. Compile with `g++ -std=c++17 main.cpp -o main`.
3. Run `./main`.
Expected output:
```text
Data: 10
```

---

## Concept Unit: The Rule of Three

### The Problem
If a class manually allocates memory, it needs a custom Destructor to free that memory. But if it has a custom Destructor, the default shallow copy behavior will cause a "double-free" crash when two copies of an object try to delete the exact same memory address.

### The New Code
```cpp
#include <iostream>

class Resource {
private:
    int* value;

public:
    // 1. Constructor (allocates memory)
    Resource(int val) {
        value = new int(val);
        std::cout << "Allocated\n";
    }

    // 2. Destructor (Rule of Three part 1)
    ~Resource() {
        delete value;
        std::cout << "Freed\n";
    }

    // 3. Copy Constructor (Rule of Three part 2)
    Resource(const Resource& other) {
        value = new int(*(other.value));
        std::cout << "Copy Constructed\n";
    }

    // 4. Copy Assignment Operator (Rule of Three part 3)
    Resource& operator=(const Resource& other) {
        if (this != &other) {
            *value = *(other.value);
            std::cout << "Copy Assigned\n";
        }
        return *this;
    }
};

int main() {
    Resource r1(100);       // Constructor
    Resource r2 = r1;       // Copy Constructor
    Resource r3(200);       // Constructor
    r3 = r1;                // Copy Assignment Operator
    
    return 0;               // Destructor called 3 times
}
```

### Mechanical Walkthrough
- `~Resource()` is the destructor. Because we manually call `delete`, we are managing our own memory.
- `Resource(const Resource& other)` is the copy constructor. It handles the deep copy when a new object is created from an existing one (`Resource r2 = r1;`).
- `Resource& operator=(const Resource& other)` is the copy assignment operator. It handles the deep copy when an existing object is overwritten (`r3 = r1;`).
- Notice that `Resource r2 = r1;` calls the copy constructor, not the assignment operator, because `r2` is being newly initialized on that exact line.

### CS Lens
The Rule of Three is a heuristic for resource management. It states that the need for any one of these three functions (Destructor, Copy Constructor, Copy Assignment Operator) almost guarantees that the class is managing a manual resource. If you only implement one, you leave a gap in the object lifecycle where the resource can be leaked, double-freed, or corrupted.

### SE Lens
The alternative not chosen is violating the rule by only writing a destructor, leading to inevitable crashes during runtime when objects are passed by value to functions or placed into standard library containers like `std::vector`. The cost of the Rule of Three is boilerplate code. Modern C++ extends this to the "Rule of Five" (adding move semantics) or the "Rule of Zero" (designing classes that don't manage their own raw resources at all).

### Run It Yourself
1. Save the code in `main.cpp`.
2. Compile with `g++ -std=c++17 main.cpp -o main`.
3. Run `./main`.
Expected output:
```text
Allocated
Copy Constructed
Allocated
Copy Assigned
Freed
Freed
Freed
```

---

## Connect the Pieces

Let's trace the lifecycle of a manually managed object being copied and printed.
1. `Buffer b1(10);` allocates memory and sets its value.
2. `Buffer b2(20);` allocates separate memory.
3. `b2 = b1;` invokes the custom copy assignment operator (`operator=`).
4. Inside the operator, `b2` checks that it is not assigning to itself (`this != &other`).
5. `b2` copies the value `10` from `b1`'s memory into its own separate memory block.
6. `std::cout << b2;` invokes the friend `operator<<`, which reaches into `b2`'s private fields to format and print the output.
7. As the program ends, `b2`'s destructor runs, freeing its memory.
8. `b1`'s destructor runs, freeing its separate memory. Both are destroyed safely without a double-free crash.

## What Breaks Without This

If you fail to implement the Rule of Three, a default shallow copy will lead to a double-free crash.

**The Broken Code:**
```cpp
class BadBuffer {
public:
    int* data;
    BadBuffer() { data = new int(10); }
    ~BadBuffer() { delete data; }
};

int main() {
    BadBuffer b1;
    BadBuffer b2 = b1; // Shallow copy! Both point to the same memory.
    return 0; // CRASH: b2 deletes the memory, then b1 tries to delete it again.
}
```

**The Error:**
```text
free(): double free detected in tcache 2
Aborted (core dumped)
```
*To fix it, you must implement a copy constructor to perform a deep copy so each object has its own separate memory to delete.*

## Exercises
1. Write a `Fraction` class containing an `int numerator` and `int denominator`. Overload the `*` operator to multiply two fractions and return a new `Fraction`.
2. Add an `operator==` to `Fraction`. Test that `Fraction(1, 2) == Fraction(1, 2)` returns true.
3. Write a friend `operator<<` for `Fraction` to print it in the format `"numerator/denominator"`.

## Definition of Done
- [ ] You understand that operator overloading is just a different syntax for method calls.
- [ ] You can overload operators like `+` and `==` to give custom types mathematical meaning.
- [ ] You know why the `friend` keyword is needed to overload `<<` for streams.
- [ ] You can explain the difference between a copy constructor and a copy assignment operator.
- [ ] You understand the Rule of Three and why custom memory management requires it to prevent crashes.
