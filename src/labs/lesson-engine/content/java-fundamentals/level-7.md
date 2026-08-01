---
series: java-fundamentals
level: 7
title: Classes & Objects
lang: java
---

# Classes & Objects

Level 5 already named the split between primitives and objects; every class this course writes from here on *is* an object type — instances created with `new`, shared by reference exactly the way `Point` was in that lesson's own examples. This lesson builds the first real classes: data (fields) and behavior (methods) combined, with `private`/`public` (Level 6) controlling what's actually exposed.

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

`class Rectangle { }` — a class declaration. A `.java` file can contain multiple classes, but only one can be `public` — which is why `Rectangle` here has no modifier at all, while `Main` does.

`double width;` — an **instance field**. Each `Rectangle` object gets its own separate `width` and `height` — creating a second `Rectangle` would give it its own pair, unrelated to `r`'s.

`new Rectangle()` — allocates a `Rectangle` on the heap and calls its constructor. No constructor is written here yet, so Java generates a default, no-argument one automatically — every field starts at its type's default value (`0.0` for `double`, per Level 2's own default-value rule for arrays, which applies to plain fields too).

`r.area()` — invokes the `area` method on `r`. Inside the method body, `width` and `height` refer to *that specific* `r`'s own fields.

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

`private double width` — per Level 6, only `Rectangle`'s own code can reach this field directly; outside code has no way to read or write it except through methods `Rectangle` itself provides.

`Rectangle(double width, double height)` — a **constructor**: same name as the class, no return type at all (not even `void`). Writing one at all replaces Java's automatically-generated default constructor from the previous example — once any constructor is written, the free no-argument one stops existing.

`this.width = width;` — `this` refers to the object the constructor is building. The parameter `width` and the field `width` share a name on purpose (a real, common convention); without the `this.` prefix, `width = width;` would just assign the parameter to itself, leaving the actual field untouched at its default `0.0`. `this.width` unambiguously means "the field," `width` alone means "the parameter" — the same object-vs-local-copy distinction Level 5 built.

## this and Method Chaining

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

`return this;` — returns a reference to the very object `add` was just called on. Since `Builder` objects are shared by reference (Level 5), this doesn't create or return a copy — it hands back the exact same `Builder`, already mutated.

`new Builder().add("Hello").add(", ")...` — this is **method chaining**: because `add` returns `this`, the next `.add(...)` can be called directly on that return value, without ever storing the `Builder` in a named variable partway through. Each call in the chain runs against the same single object, accumulating `result` one piece at a time.

## A Class Enforcing Its Own Rules

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

`private double balance` — hidden the same way Level 6's `Account.balance` was; `account.balance` from `Main` would be a compile error, forcing every read and write through `BankAccount`'s own methods.

`initialBalance >= 0 ? initialBalance : 0` — the **ternary operator**: a compact `if`/`else` that produces a value rather than running a statement. Reads as "if `initialBalance >= 0`, use `initialBalance`; otherwise use `0`" — one expression instead of a four-line `if`/`else` block.

`getBalance()` — a **getter**: the standard pattern for exposing a `private` field as read-only from outside.

**SE lens:** This is **encapsulation** in practice, not just in name — the invariant "`balance` is never negative" is enforced by `BankAccount` itself, in exactly one place (the constructor's ternary, and `withdraw`'s own guard against `amount > balance`). No outside code can ever bypass those checks, because no outside code can ever touch `balance` directly. Compare this to a version with a `public double balance` field instead: nothing would stop `account.balance = -999;` from silently corrupting it anywhere in the program, and finding every place that could have caused it would mean searching the entire codebase instead of one class.

## Challenge: stack

Implement a `Stack` class that works with integers:
- A private `int[]` field `items` with capacity `100` and a private `int` field `top` initialized to `-1`
- `void push(int value)` — adds a value to the top
- `int pop()` — removes and returns the top value (assume the stack is not empty)
- `int peek()` — returns the top value without removing it
- `int size()` — returns the number of elements

```challenge
class Stack {
    // TODO
}
```

```test
Stack s = new Stack();
s.push(10);
s.push(20);
s.push(30);
assert s.peek() == 30
assert s.size() == 3
assert s.pop() == 30
assert s.size() == 2
assert s.peek() == 20
```
