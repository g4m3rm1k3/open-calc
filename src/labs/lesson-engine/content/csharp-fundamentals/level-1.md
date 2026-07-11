---
series: csharp-fundamentals
level: 1
title: Classes & Properties
lang: csharp
---

# Classes & Properties

A class in C# bundles data and behaviour together and controls access through **access modifiers**. C# adds **properties** — a cleaner alternative to manual getters and setters that look like fields but execute code on access. This lesson covers class creation, constructors, fields, properties, and the `new` keyword.

## Defining a Class

```csharp
using System;

class Rectangle
{
    public double Width;
    public double Height;

    public double Area()
    {
        return Width * Height;
    }

    public double Perimeter()
    {
        return 2 * (Width + Height);
    }
}

class Program
{
    static void Main()
    {
        Rectangle r = new Rectangle();
        r.Width = 5.0;
        r.Height = 3.0;

        Console.WriteLine(r.Area());
        Console.WriteLine(r.Perimeter());
    }
}
```

```text
15
16
```

`public` — accessible from anywhere. `private` (default when no modifier is written) — accessible only within the class.

`new Rectangle()` — creates a new instance of `Rectangle` on the heap and calls its constructor. The `new` keyword always allocates on the managed heap (C# handles memory with a garbage collector — you do not free objects manually).

`r.Area()` — calls the `Area` method on the `r` instance. Inside the method, `Width` and `Height` refer to `r.Width` and `r.Height`.

## Constructors

A constructor initialises an object when it is created with `new`:

```csharp
using System;

class Rectangle
{
    public double Width;
    public double Height;

    public Rectangle(double width, double height)
    {
        Width = width;
        Height = height;
    }

    public double Area() => Width * Height;
}

class Program
{
    static void Main()
    {
        Rectangle r = new Rectangle(5.0, 3.0);
        Console.WriteLine(r.Area());

        var unit = new Rectangle(1.0, 1.0);
        Console.WriteLine(unit.Area());
    }
}
```

```text
15
1
```

`public Rectangle(double width, double height)` — a constructor. Same name as the class, no return type.

`public double Area() => Width * Height;` — an **expression-bodied method**: shorthand for a method with a single `return` statement. `=>` replaces `{ return ...; }`.

`var unit = new Rectangle(1.0, 1.0)` — `var` infers the type as `Rectangle`. Equivalent to `Rectangle unit = new Rectangle(1.0, 1.0)`.

## Properties — Smarter Fields

Properties expose data with optional logic on read and write:

```csharp
using System;

class BankAccount
{
    private double _balance;

    public double Balance
    {
        get { return _balance; }
        private set
        {
            if (value < 0) throw new ArgumentException("Balance cannot be negative");
            _balance = value;
        }
    }

    public BankAccount(double initialBalance)
    {
        Balance = initialBalance;
    }

    public void Deposit(double amount)
    {
        if (amount > 0) Balance += amount;
    }

    public bool Withdraw(double amount)
    {
        if (amount <= 0 || amount > Balance) return false;
        Balance -= amount;
        return true;
    }
}

class Program
{
    static void Main()
    {
        var account = new BankAccount(100.0);
        account.Deposit(50.0);
        Console.WriteLine(account.Balance);
        Console.WriteLine(account.Withdraw(30.0));
        Console.WriteLine(account.Balance);
    }
}
```

```text
150
True
120
```

`private double _balance` — the backing field. By convention, private fields in C# use a leading underscore.

`public double Balance { get { ... } private set { ... } }` — a property. The `get` accessor runs when you read `account.Balance`. The `private set` accessor runs when code inside the class writes `Balance = value`.

`value` inside `set` — a special keyword that holds whatever was assigned to the property.

`private set` — the property can be read from anywhere (`public`) but only written from within the class (`private set`).

## Auto-Properties

When no logic is needed in get/set, C# provides **auto-properties**:

```csharp
class Person
{
    public string Name { get; set; }
    public int Age { get; private set; }

    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }
}
```

`public string Name { get; set; }` — the compiler generates a hidden backing field. No logic, just store and retrieve.

`public int Age { get; private set; }` — can be read publicly but only set inside the class.

**SE lens:** Properties are preferred over public fields in C# because they maintain encapsulation: you can later add validation or computed logic to a property without changing any code that reads it, because the calling syntax does not change.

## Challenge: temperature_converter

Write a `Temperature` class with:
- A private `double _celsius` field
- A `Celsius` property (get/set) that stores the temperature
- A `Fahrenheit` property (get only) that returns `Celsius * 9.0 / 5.0 + 32.0`
- A constructor that takes a `double celsius` parameter

Then in `Main`, create a `Temperature` with `100.0`, print both `Celsius` and `Fahrenheit`, then set `Celsius = 0.0` and print both again.

```challenge
using System;

class Temperature
{
    // TODO
}

class Program
{
    static void Main()
    {
        var t = new Temperature(100.0);
        Console.WriteLine(t.Celsius);
        Console.WriteLine(t.Fahrenheit);
        t.Celsius = 0.0;
        Console.WriteLine(t.Celsius);
        Console.WriteLine(t.Fahrenheit);
    }
}
```

```test
// Expected output:
// 100
// 212
// 0
// 32
```
