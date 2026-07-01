# Classes and Object-Oriented Programming: Why Bjarne Built C++

We have arrived at the reason C++ exists. In 1979, Bjarne Stroustrup was analyzing his Cambridge dissertation on distributed operating systems and discovered a fundamental problem: the simulation he was writing needed to model concurrent processes — each with its own state, behavior, and lifecycle. C didn't have a way to express this cleanly. You could fake it with structs and function pointers, but there was no *type* that bundled data and the operations on that data into a single cohesive unit.

The language he'd studied at the Aarhus University, **Simula 67**, did. Simula — designed by Ole-Johan Dahl and Kristen Nygaard in Norway in 1967 — introduced the concept of the **class**: a user-defined type that combined data (called fields) and behavior (called methods). Stroustrup took Simula's class system and grafted it onto C. The result, after years of refinement, became C++.

Object-oriented programming in C++ is not decoration. It's the language's original reason for being.

## What a Class Is

A class is a **user-defined type**. Just as `int` defines a type that stores integers and supports arithmetic operators, a class defines a type that stores custom data and supports custom operations. The data members are called **fields** or **member variables**. The operations are called **member functions** or **methods**.

```cpp
#include <iostream>
#include <string>
#include <cmath>

class Point {
public:           // Public: accessible from outside the class
    double x;
    double y;

    // Constructor: called when an object is created
    Point(double x, double y) : x(x), y(y) {}

    // Member function: operates on this object
    double distanceTo(const Point& other) const {
        double dx = x - other.x;
        double dy = y - other.y;
        return std::sqrt(dx * dx + dy * dy);
    }

    double magnitude() const {
        return std::sqrt(x * x + y * y);
    }

    // Operator overloading: + creates a new point
    Point operator+(const Point& other) const {
        return Point(x + other.x, y + other.y);
    }

    void print() const {
        std::cout << "(" << x << ", " << y << ")" << std::endl;
    }
};

int main() {
    Point p1(3.0, 4.0);
    Point p2(0.0, 0.0);

    p1.print();
    std::cout << "Magnitude: " << p1.magnitude() << std::endl;  // 5.0 (3-4-5 triangle)
    std::cout << "Distance to origin: " << p1.distanceTo(p2) << std::endl;

    Point p3 = p1 + p2;  // Uses operator+
    p3.print();
}
```

The `const` at the end of member functions like `magnitude() const` is a promise: "this function does not modify the object." It's part of C++'s **const-correctness** system — a compile-time check that prevents accidentally modifying objects through const references.

## Encapsulation: Private by Default

One of OOP's core principles is **encapsulation** — hiding implementation details behind a public interface. The class decides what the outside world can access:

```cpp
#include <iostream>
#include <string>
#include <stdexcept>

class BankAccount {
private:
    std::string owner;
    double balance;
    int transactionCount;

public:
    // Constructor: enforces valid initial state
    BankAccount(const std::string& owner, double initialBalance)
        : owner(owner), balance(0.0), transactionCount(0) {
        if (initialBalance < 0) {
            throw std::invalid_argument("Initial balance cannot be negative");
        }
        balance = initialBalance;
    }

    // Public interface — controlled access to private data
    void deposit(double amount) {
        if (amount <= 0) throw std::invalid_argument("Deposit must be positive");
        balance += amount;
        transactionCount++;
    }

    void withdraw(double amount) {
        if (amount <= 0) throw std::invalid_argument("Withdrawal must be positive");
        if (amount > balance) throw std::runtime_error("Insufficient funds");
        balance -= amount;
        transactionCount++;
    }

    // Getters — read-only access
    double getBalance() const { return balance; }
    int getTransactionCount() const { return transactionCount; }

    void printStatement() const {
        std::cout << "Account owner: " << owner << std::endl;
        std::cout << "Balance: $" << balance << std::endl;
        std::cout << "Transactions: " << transactionCount << std::endl;
    }
};

int main() {
    BankAccount account("Alice", 1000.0);

    account.deposit(500.0);
    account.withdraw(200.0);
    account.deposit(150.0);

    account.printStatement();

    // This would not compile — balance is private:
    // account.balance = 999999;  // error: 'balance' is private

    try {
        account.withdraw(5000.0);
    } catch (const std::runtime_error& e) {
        std::cout << "Error: " << e.what() << std::endl;
    }
}
```

The private members `balance` and `transactionCount` can only be modified through the public interface — `deposit` and `withdraw`. The class can enforce invariants (balance never negative) that external code couldn't accidentally violate.

## Constructors and Destructors: RAII

The **constructor** is called automatically when an object is created. The **destructor** is called automatically when an object is destroyed — when it goes out of scope, or when `delete` is called on a heap-allocated object.

This automatic pair forms the basis of **RAII** (Resource Acquisition Is Initialization) — C++'s most important idiom:

> Acquire resources in the constructor. Release them in the destructor. The compiler guarantees the destructor runs, even if an exception is thrown.

```cpp
#include <iostream>
#include <fstream>
#include <stdexcept>

class FileGuard {
private:
    std::ofstream file;
    std::string filename;

public:
    FileGuard(const std::string& path) : filename(path) {
        file.open(path);
        if (!file.is_open()) {
            throw std::runtime_error("Cannot open: " + path);
        }
        std::cout << "Opened: " << path << std::endl;
    }

    // RAII: destructor closes the file automatically
    ~FileGuard() {
        if (file.is_open()) {
            file.close();
            std::cout << "Closed: " << filename << std::endl;
        }
    }

    void write(const std::string& text) {
        file << text << std::endl;
    }
};

int main() {
    {
        FileGuard fg("/tmp/test.txt");
        fg.write("Hello from RAII!");
        fg.write("File will close automatically.");
        // fg goes out of scope here — destructor called — file closed
    }

    // No explicit close() needed — the destructor handled it
    std::cout << "Done — file was closed when fg went out of scope" << std::endl;
}
```

RAII eliminates a whole class of resource leaks. In garbage-collected languages, you need explicit `close()`, `dispose()`, or `with` blocks. In C++, wrapping a resource in a class gives you automatic cleanup for free, and it's exception-safe — even if an exception is thrown inside the braces, the destructor still runs.

## Operator Overloading: Making User Types Feel Native

Bjarne added operator overloading to make user-defined types as expressive as built-in types. A `Matrix` class should be addable with `+`. A `Vector3D` class should be multiplicable by a scalar with `*`. A string class should concatenate with `+`.

```cpp
#include <iostream>

class Vector2D {
public:
    double x, y;

    Vector2D(double x = 0, double y = 0) : x(x), y(y) {}

    Vector2D operator+(const Vector2D& other) const {
        return Vector2D(x + other.x, y + other.y);
    }

    Vector2D operator*(double scalar) const {
        return Vector2D(x * scalar, y * scalar);
    }

    double dot(const Vector2D& other) const {
        return x * other.x + y * other.y;
    }

    bool operator==(const Vector2D& other) const {
        return x == other.x && y == other.y;
    }

    // Stream output operator (friend: not a member, but needs private access)
    friend std::ostream& operator<<(std::ostream& os, const Vector2D& v) {
        return os << "(" << v.x << ", " << v.y << ")";
    }
};

int main() {
    Vector2D a(1.0, 2.0);
    Vector2D b(3.0, 4.0);

    Vector2D sum = a + b;
    Vector2D scaled = a * 3.0;

    std::cout << "a = " << a << std::endl;
    std::cout << "b = " << b << std::endl;
    std::cout << "a + b = " << sum << std::endl;
    std::cout << "a * 3 = " << scaled << std::endl;
    std::cout << "a · b = " << a.dot(b) << std::endl;
}
```

The `operator<<` overload as a `friend` function is a common pattern for printing. `friend` gives a non-member function access to private members — necessary here because `operator<<` must take `ostream&` as its first argument (it can't be a member of `Vector2D`).

## Inheritance: Building on Existing Types

C++ allows classes to inherit from other classes, getting their data and behavior:

```cpp
#include <iostream>
#include <string>
#include <cmath>

class Shape {
protected:
    std::string color;

public:
    Shape(const std::string& color) : color(color) {}

    virtual double area() const = 0;     // Pure virtual — subclasses MUST implement
    virtual double perimeter() const = 0;

    virtual void describe() const {
        std::cout << color << " shape with area " << area()
                  << " and perimeter " << perimeter() << std::endl;
    }

    virtual ~Shape() {}  // Virtual destructor — essential for polymorphism
};

class Circle : public Shape {
    double radius;
public:
    Circle(const std::string& color, double radius)
        : Shape(color), radius(radius) {}

    double area() const override { return M_PI * radius * radius; }
    double perimeter() const override { return 2 * M_PI * radius; }
};

class Rectangle : public Shape {
    double width, height;
public:
    Rectangle(const std::string& color, double w, double h)
        : Shape(color), width(w), height(h) {}

    double area() const override { return width * height; }
    double perimeter() const override { return 2 * (width + height); }
};

int main() {
    // Polymorphism: Shape* can point to any Shape subclass
    Shape* shapes[] = {
        new Circle("red", 5.0),
        new Rectangle("blue", 4.0, 6.0),
        new Circle("green", 3.0)
    };

    for (auto* shape : shapes) {
        shape->describe();  // Calls the correct subclass method at runtime
        delete shape;
    }
}
```

**Virtual functions** enable **runtime polymorphism**: the decision of which `area()` to call is made at runtime based on the actual type of the object, not the pointer type. This is how game engines render different types of entities, how GUI frameworks handle different widget types, and how parsers process different node types — one interface, many implementations.

Classes in C++ are not a style choice. They're the fundamental mechanism for building large, maintainable programs — the reason the language was created, and the reason it endures.
