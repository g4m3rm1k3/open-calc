---
series: cpp-fundamentals
level: 6
title: Classes & Constructors
lang: cpp
---

# Classes & Constructors

A class is a struct with functions attached to it. Those functions are called **member functions** (or methods), and they can access the class's data fields directly — without being passed them as parameters. The class also controls which parts of its data are visible from outside (public) and which are hidden (private). This combination of data and behaviour, with controlled access, is the foundation of object-oriented programming.

## Class vs Struct

In C++, `class` and `struct` are nearly identical. The only difference: members are `private` by default in a `class`, and `public` by default in a `struct`. Convention: use `struct` for plain data containers; use `class` when behaviour and encapsulation matter.

## Defining a Class

```cpp
#include <iostream>
using namespace std;

class Rectangle {
public:
    double width;
    double height;

    double area() {
        return width * height;
    }

    double perimeter() {
        return 2 * (width + height);
    }
};

int main() {
    Rectangle r;
    r.width = 5.0;
    r.height = 3.0;

    cout << "Area: "      << r.area()      << endl;
    cout << "Perimeter: " << r.perimeter() << endl;

    return 0;
}
```

```text
Area: 15
Perimeter: 16
```

`public:` — everything below this label is accessible from outside the class. Without it, members would be `private` (inaccessible from `main`).

`double area()` — a member function. Inside, `width` and `height` refer to the calling object's fields — no parameter needed.

`r.area()` — calls `area` on the object `r`. Inside the call, `width` means `r.width`.

## Constructors — Initialising Objects

A constructor is a special function that runs when an object is created. It has no return type and the same name as the class:

```cpp
#include <iostream>
using namespace std;

class Rectangle {
public:
    double width;
    double height;

    Rectangle(double w, double h) {
        width = w;
        height = h;
    }

    double area() {
        return width * height;
    }
};

int main() {
    Rectangle r(5.0, 3.0);
    cout << "Area: " << r.area() << endl;

    Rectangle unit(1.0, 1.0);
    cout << "Unit area: " << unit.area() << endl;

    return 0;
}
```

```text
Area: 15
Unit area: 1
```

`Rectangle(double w, double h)` — the constructor. Runs immediately when `Rectangle r(5.0, 3.0)` is evaluated.

`Rectangle r(5.0, 3.0)` — creates a `Rectangle` and calls the constructor with `w=5.0`, `h=3.0`.

If you define any constructor, the compiler no longer generates a default (no-argument) constructor. `Rectangle r;` would now be a compile error.

## Private Data and Encapsulation

Hiding fields as `private` forces all access through methods, which lets you enforce invariants (rules the data must satisfy):

```cpp
#include <iostream>
using namespace std;

class BankAccount {
private:
    double balance;

public:
    BankAccount(double initialBalance) {
        if (initialBalance < 0) initialBalance = 0;
        balance = initialBalance;
    }

    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }

    bool withdraw(double amount) {
        if (amount > balance || amount <= 0) return false;
        balance -= amount;
        return true;
    }

    double getBalance() {
        return balance;
    }
};

int main() {
    BankAccount account(100.0);
    account.deposit(50.0);
    bool ok = account.withdraw(30.0);
    cout << "Withdrew: " << ok << endl;
    cout << "Balance: " << account.getBalance() << endl;

    bool fail = account.withdraw(500.0);
    cout << "Overdraft attempt: " << fail << endl;
    cout << "Balance: " << account.getBalance() << endl;

    return 0;
}
```

```text
Withdrew: 1
Balance: 120
Overdraft attempt: 0
Balance: 120
```

`private: double balance;` — `balance` cannot be read or written directly from outside the class. `account.balance = -999;` would be a compile error.

`getBalance()` — a **getter**: a public method that returns a private field's value (read-only access from outside).

**CS lens:** Encapsulation is an invariant enforcer. The invariant here is "balance is never negative." Every path that modifies `balance` (the constructor, `deposit`, `withdraw`) checks this before changing the value. Code outside the class cannot bypass these checks.

## The `this` Pointer

Inside a member function, `this` is a pointer to the current object. Use it to resolve ambiguity when parameter names shadow field names:

```cpp
#include <iostream>
using namespace std;

class Point {
public:
    double x;
    double y;

    Point(double x, double y) {
        this->x = x;
        this->y = y;
    }

    void print() {
        cout << "(" << this->x << ", " << this->y << ")" << endl;
    }
};

int main() {
    Point p(3.0, 4.0);
    p.print();
    return 0;
}
```

```text
(3, 4)
```

`this->x = x` — `this->x` is the field; the bare `x` is the parameter. Without `this->`, both would refer to the parameter and the field would remain uninitialised.

## Challenge: counter

Implement a `Counter` class with:
- A private `int` field `count` initialised to `0` in the constructor
- A `void increment()` method that adds 1
- A `void decrement()` method that subtracts 1, but never below 0
- An `int getCount()` method that returns the current count
- A `void reset()` method that sets `count` to 0

```challenge
class Counter {
    // TODO
};
```

```test
Counter c;
assert c.getCount() == 0
c.increment();
c.increment();
assert c.getCount() == 2
c.decrement();
assert c.getCount() == 1
c.decrement();
c.decrement();
assert c.getCount() == 0   // decrement never goes below 0
c.increment();
c.reset();
assert c.getCount() == 0
```
