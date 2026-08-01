---
series: csharp-fundamentals
level: 11
title: Inheritance & Polymorphism
lang: csharp
---

# Inheritance & Polymorphism

Every class so far has stood alone. Real programs often have genuine "is a more specific kind of" relationships — a `Dog` really is a kind of `Animal`, sharing real behavior with every other animal while adding its own. **Inheritance** lets one class extend another, gaining everything the base class already has. **Polymorphism** — this lesson's second half — lets code written against the general `Animal` type automatically run the correct, specific behavior for whatever real animal it's actually holding.

## A Class Extending Another

```csharp
using System;

class Animal
{
    public string Name;

    public Animal(string name)
    {
        Name = name;
    }

    public void Describe()
    {
        Console.WriteLine(Name + " is an animal");
    }
}

class Dog : Animal
{
    public Dog(string name) : base(name) { }

    public void Bark()
    {
        Console.WriteLine(Name + " says Woof");
    }
}

class Program
{
    static void Main()
    {
        Dog d = new Dog("Rex");
        d.Describe();
        d.Bark();
    }
}
```

```text
Rex is an animal
Rex says Woof
```

`class Dog : Animal` — `Dog` **inherits** from `Animal`. Every `public` (or `protected`) member `Animal` has, `Dog` automatically has too — `d.Describe()` works even though `Dog` never wrote a `Describe` method itself.

`public Dog(string name) : base(name) { }` — `Dog`'s own constructor, forwarding `name` straight to `Animal`'s constructor via `: base(name)`. `Animal`'s constructor runs first, setting `Name`, before `Dog`'s own (empty) constructor body runs.

`Name`, used inside `Bark()` — `Dog` never declared its own `Name` field. It's using the one it inherited from `Animal` directly.

**CS lens:** `Animal` is called the **base class**; `Dog` is the **derived class**. Inheritance is a one-way relationship — `Dog` knows everything about `Animal`, but `Animal` has no idea `Dog` exists, and a plain `Animal` object could never call `Bark()`.

## virtual and override — Changing Inherited Behavior

```csharp
using System;

class Animal
{
    public virtual string Speak()
    {
        return "...";
    }
}

class Dog : Animal
{
    public override string Speak()
    {
        return "Woof";
    }
}

class Cat : Animal
{
    public override string Speak()
    {
        return "Meow";
    }
}

class Program
{
    static void Main()
    {
        Animal[] animals = { new Dog(), new Cat(), new Animal() };
        foreach (Animal a in animals)
        {
            Console.WriteLine(a.Speak());
        }
    }
}
```

```text
Woof
Meow
...
```

`public virtual string Speak()` — marks `Speak` as explicitly replaceable by a derived class.
`public override string Speak()` — `Dog` and `Cat` each provide their own real implementation.

`Animal[] animals = { new Dog(), new Cat(), new Animal() }` — an array of the *base* type, `Animal`, holding three genuinely different real objects.

`a.Speak()` inside the loop — `a`'s declared type is always `Animal`, for every single iteration, and yet three different real strings print. C# looks at what `a` **actually is** at runtime, not what type the variable is declared as, and calls that specific object's own `Speak()` — `Dog`'s, then `Cat`'s, then plain `Animal`'s own default.

**CS lens:** This is **polymorphism** — literally "many forms": one line of code, `a.Speak()`, produces different real behavior depending on the real object behind `a`. Without `virtual`/`override`, `Speak()` would resolve the same way for every element — whatever `Animal.Speak()` itself does — regardless of whether `a` really held a `Dog` or a `Cat`.

## base — Calling the Parent's Own Implementation

```csharp
using System;

class Animal
{
    public virtual string Speak()
    {
        return "...";
    }
}

class Dog : Animal
{
    public override string Speak()
    {
        return base.Speak() + " then Woof";
    }
}

class Program
{
    static void Main()
    {
        Dog d = new Dog();
        Console.WriteLine(d.Speak());
    }
}
```

```text
... then Woof
```

`base.Speak()` — calls `Animal`'s own original `Speak()`, even from inside `Dog`'s `override`. An `override` doesn't have to fully replace the base behavior — it can extend it, running the base version first (or last) and adding to it.

## abstract Classes — a Base That Can Never Stand Alone

```csharp
using System;

abstract class Shape
{
    public abstract double Area();

    public void PrintArea()
    {
        Console.WriteLine("Area: " + Area());
    }
}

class Square : Shape
{
    private double _side;

    public Square(double side)
    {
        _side = side;
    }

    public override double Area()
    {
        return _side * _side;
    }
}

class Program
{
    static void Main()
    {
        Shape s = new Square(4);
        s.PrintArea();
    }
}
```

```text
Area: 16
```

`abstract class Shape` — cannot be instantiated with `new Shape()` directly — attempting it is a real compile error. `abstract` marks a class as existing only to be inherited from.

`public abstract double Area();` — no body at all, just a signature ending in `;`. Every non-abstract class that inherits from `Shape` **must** provide a real `Area()`, enforced by the compiler — `Square` supplies one; a class that forgot to would fail to compile.

`public void PrintArea() { ... Area() ... }` — an ordinary, fully-implemented method, calling the `abstract` one. `Shape` provides real, shared behavior (`PrintArea`) alongside a required, enforced gap (`Area`) every derived class must fill in — the mix is exactly what makes `abstract` different from an interface, which can never provide a default implementation for anything.

**SE lens:** `abstract` is the right choice specifically when a base type genuinely shouldn't exist on its own — "a shape, with no specific kind of shape" has no real `Area()` to compute, so `Shape` forbids ever creating one directly, while still sharing real code (`PrintArea`) across every concrete shape that does exist.

## Challenge: employee_pay

Write an `abstract class Employee` with:
- A `public string Name` field, set through a constructor `Employee(string name)`
- An `public abstract double CalculatePay()` method

Then write two derived classes:
- `SalariedEmployee : Employee` — constructor `SalariedEmployee(string name, double monthlySalary)`, `CalculatePay()` returns `monthlySalary`
- `HourlyEmployee : Employee` — constructor `HourlyEmployee(string name, double hourlyRate, double hoursWorked)`, `CalculatePay()` returns `hourlyRate * hoursWorked`

```challenge
abstract class Employee
{
    // TODO
}

class SalariedEmployee : Employee
{
    // TODO
}

class HourlyEmployee : Employee
{
    // TODO
}
```

```test
Employee salaried = new SalariedEmployee("Alice", 5000.0);
assert salaried.Name == "Alice"
assert salaried.CalculatePay() == 5000.0
Employee hourly = new HourlyEmployee("Bob", 25.0, 40.0);
assert hourly.Name == "Bob"
assert hourly.CalculatePay() == 1000.0
Employee[] staff = { salaried, hourly };
assert staff[0].CalculatePay() == 5000.0
assert staff[1].CalculatePay() == 1000.0
```
