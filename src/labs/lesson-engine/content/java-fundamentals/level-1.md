---
series: java-fundamentals
level: 1
title: Classes & Methods
lang: java
---

# Classes & Methods

A Java class combines data (fields) and behaviour (methods) and controls access with **access modifiers**. Every object is an instance of a class, created with `new`. Understanding how to define fields, write constructors, and call instance methods is the core skill for all Java programming.

## Defining a Class

```java
class Rectangle {
    double width;
    double height;

    double area() {
        return width * height;
    }

    double perimeter() {
        return 2 * (width + height);
    }
}

public class Main {
    public static void main(String[] args) {
        Rectangle r = new Rectangle();
        r.width = 5.0;
        r.height = 3.0;

        System.out.println(r.area());
        System.out.println(r.perimeter());
    }
}
```

```text
15.0
16.0
```

`class Rectangle { }` — a class declaration. A `.java` file can contain multiple classes, but only one can be `public`.

`double width;` — an **instance field**. Each `Rectangle` object has its own `width` and `height`.

`new Rectangle()` — allocates a `Rectangle` on the heap and calls the constructor (a default no-arg constructor is generated when none is defined).

`r.area()` — invokes the `area` method on `r`. Inside the method, `width` and `height` refer to `r`'s fields.

## Constructors

```java
class Rectangle {
    private double width;
    private double height;

    Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    double area() { return width * height; }
    String describe() { return width + "x" + height + " rectangle"; }
}

public class Main {
    public static void main(String[] args) {
        Rectangle r = new Rectangle(5.0, 3.0);
        System.out.println(r.area());
        System.out.println(r.describe());
    }
}
```

```text
15.0
5.0x3.0 rectangle
```

`private double width` — `private` fields are accessible only within the class. This hides the implementation from outside code.

`this.width = width` — `this` refers to the current object. Without `this.`, both sides of `=` would refer to the parameter, leaving the field unchanged.

`Rectangle(double width, double height)` — a constructor. Same name as the class, no return type.

## Access Modifiers and Encapsulation

```java
class BankAccount {
    private double balance;

    BankAccount(double initialBalance) {
        this.balance = initialBalance >= 0 ? initialBalance : 0;
    }

    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }

    boolean withdraw(double amount) {
        if (amount <= 0 || amount > balance) return false;
        balance -= amount;
        return true;
    }

    double getBalance() { return balance; }
}

public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount(100.0);
        account.deposit(50.0);
        System.out.println(account.withdraw(30.0));
        System.out.println(account.getBalance());
        System.out.println(account.withdraw(500.0));
    }
}
```

```text
true
120.0
false
```

`private double balance` — hidden from all external code. `account.balance = -999;` would be a compile error.

`getBalance()` — a **getter**: the conventional pattern for exposing a private field as read-only.

`initialBalance >= 0 ? initialBalance : 0` — the ternary operator. Same as an `if`/`else` expression.

**SE lens:** Encapsulation means the class owns its invariant. The invariant here is "balance is never negative." Every code path that touches `balance` enforces it — external code cannot bypass the check.

## this and Method Chaining

`this` inside a method always refers to the object the method was called on:

```java
class Builder {
    private String result = "";

    Builder add(String text) {
        result += text;
        return this;
    }

    String build() { return result; }
}

public class Main {
    public static void main(String[] args) {
        String sentence = new Builder()
            .add("Hello")
            .add(", ")
            .add("World")
            .add("!")
            .build();
        System.out.println(sentence);
    }
}
```

```text
Hello, World!
```

`return this` — returns the current object. This enables **method chaining**: each call returns the same `Builder`, so the next call can be chained directly.

## Challenge: stack

Implement a `Stack` class that works with integers:
- A private `int[]` field `items` with capacity 100 and a private `int` field `top` initialised to -1
- `void push(int value)` — adds a value to the top
- `int pop()` — removes and returns the top value (assume the stack is not empty)
- `int peek()` — returns the top value without removing it
- `int size()` — returns the number of elements

In `main`, push 3 values, print `peek()`, call `pop()`, then print `size()`.

```challenge
class Stack {
    // TODO
}

public class Main {
    public static void main(String[] args) {
        Stack s = new Stack();
        s.push(10);
        s.push(20);
        s.push(30);
        System.out.println(s.peek());
        s.pop();
        System.out.println(s.size());
    }
}
```

```test
// Expected output:
// 30
// 2
```
