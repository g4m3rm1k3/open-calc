# Classes, Objects, and Records

C# is fundamentally an object-oriented language — most code you write lives inside a **class**. But C# has evolved beyond classical OOP. C# 9 introduced **records**: immutable, value-semantics types defined in one line that replace the boilerplate-heavy classes that OOP traditionally demands for data. Understanding both the classical and modern approaches is essential to reading real C# codebases.

## Defining a Class

A class is a blueprint. An **object** (also called an **instance**) is created from that blueprint with `new`:

```csharp
class Person
{
    // Fields: raw data storage (typically private)
    private string _name;
    private int _age;

    // Constructor: called when you write new Person(...)
    public Person(string name, int age)
    {
        _name = name;
        _age  = age;
    }

    // Properties: controlled access to fields
    public string Name
    {
        get => _name;
        set => _name = value ?? throw new ArgumentNullException(nameof(value));
    }

    public int Age
    {
        get => _age;
        set
        {
            if (value < 0) throw new ArgumentOutOfRangeException(nameof(value));
            _age = value;
        }
    }

    // Method
    public string Greet() => $"Hi, I'm {_name}, age {_age}.";

    // Override ToString — called automatically by Console.WriteLine, string interpolation, etc.
    public override string ToString() => $"Person({_name}, {_age})";
}

var alice = new Person("Alice", 30);
Console.WriteLine(alice.Greet());    // Hi, I'm Alice, age 30.
Console.WriteLine(alice);            // Person(Alice, 30) — uses ToString()
alice.Age = 31;                      // Property setter
// alice.Age = -1;                   // Would throw ArgumentOutOfRangeException
```

## Auto-Properties

Writing a backing field for every property is tedious when no special validation is needed. **Auto-properties** let the compiler generate the backing field for you:

```csharp
class Product
{
    // The compiler generates a private backing field automatically
    public string Name    { get; set; }
    public decimal Price  { get; set; }
    public int Stock      { get; private set; }   // External code can read, not write

    // Read-only auto-property — can only be set in constructor or with init
    public Guid Id { get; } = Guid.NewGuid();

    public Product(string name, decimal price, int stock)
    {
        Name  = name;
        Price = price;
        Stock = stock;
    }

    public void Restock(int units) => Stock += units;
}

var p = new Product("Widget", 9.99m, 100);
Console.WriteLine(p.Id);        // A new Guid every time
p.Restock(50);
Console.WriteLine(p.Stock);     // 150
// p.Stock = 0;                 // Compile error: private set
```

## Constructors and Constructor Chaining

A class can have multiple constructors. Use `this(...)` to chain them — the chained constructor runs first:

```csharp
class Rectangle
{
    public double Width  { get; }
    public double Height { get; }

    // Primary constructor
    public Rectangle(double width, double height)
    {
        Width  = width;
        Height = height;
    }

    // Convenience constructor: a square
    public Rectangle(double side) : this(side, side) { }

    // Default: unit square
    public Rectangle() : this(1.0) { }

    public double Area      => Width * Height;
    public double Perimeter => 2 * (Width + Height);

    public override string ToString() => $"Rectangle({Width} × {Height})";
}

Console.WriteLine(new Rectangle(4, 3).Area);       // 12
Console.WriteLine(new Rectangle(5).Area);           // 25 — square
Console.WriteLine(new Rectangle().Perimeter);       // 4 — unit square
```

## Object Initializers

You can set properties at construction without writing a constructor for every combination, using **object initializers**:

```csharp
class Config
{
    public string Host    { get; set; } = "localhost";
    public int    Port    { get; set; } = 8080;
    public bool   UseTls  { get; set; } = false;
    public int    Timeout { get; set; } = 30;
}

// Set only what you want to change — the rest use defaults
var cfg = new Config
{
    Host   = "api.example.com",
    Port   = 443,
    UseTls = true,
    // Timeout stays 30
};

Console.WriteLine($"{cfg.Host}:{cfg.Port} TLS={cfg.UseTls}");
```

Object initializers work on any settable property. They're extremely common in C# for configuration, test data, and DTOs.

## `static` Members and the `static` Class

`static` members belong to the type, not to any instance. A `static` class can only contain `static` members and cannot be instantiated:

```csharp
static class MathUtils
{
    public static double Clamp(double value, double min, double max)
        => Math.Max(min, Math.Min(max, value));

    public static double Lerp(double a, double b, double t)
        => a + (b - a) * t;

    // Constants are implicitly static
    public const double GoldenRatio = 1.6180339887;
}

Console.WriteLine(MathUtils.Clamp(150, 0, 100));   // 100
Console.WriteLine(MathUtils.Lerp(0, 100, 0.25));   // 25
```

## Inheritance

A class can inherit from one base class, gaining its fields, properties, and methods. The derived class can extend or override the base:

```csharp
class Animal
{
    public string Name { get; }

    public Animal(string name)
    {
        Name = name;
    }

    // virtual: derived classes may override this
    public virtual string Speak() => "...";

    public override string ToString() => $"{GetType().Name}({Name})";
}

class Dog : Animal
{
    public string Breed { get; }

    public Dog(string name, string breed) : base(name)   // Call base constructor
    {
        Breed = breed;
    }

    public override string Speak() => "Woof!";   // override — replaces base implementation
}

class Cat : Animal
{
    public Cat(string name) : base(name) { }

    public override string Speak() => "Meow.";
}

Animal[] animals = { new Dog("Rex", "Labrador"), new Cat("Whiskers"), new Dog("Buddy", "Poodle") };

foreach (var animal in animals)
    Console.WriteLine($"{animal.Name} says: {animal.Speak()}");
// Rex says: Woof!
// Whiskers says: Meow.
// Buddy says: Woof!
```

The array is typed as `Animal[]` but each element is actually a `Dog` or `Cat`. When `.Speak()` is called, C#'s **virtual dispatch** finds the correct overriding method at runtime. This is **polymorphism**.

## `sealed`, `abstract`, and `base`

```csharp
// abstract: can't be instantiated — must be subclassed
abstract class Shape
{
    public abstract double Area { get; }         // Must be implemented by subclass
    public abstract double Perimeter { get; }

    public virtual string Describe()             // Optional to override
        => $"{GetType().Name}: area={Area:F2}, perimeter={Perimeter:F2}";
}

class Circle : Shape
{
    public double Radius { get; }
    public Circle(double r) { Radius = r; }

    public override double Area      => Math.PI * Radius * Radius;
    public override double Perimeter => 2 * Math.PI * Radius;
}

// sealed: no further inheritance allowed
sealed class ImmutablePoint : Shape
{
    public double X { get; }
    public double Y { get; }
    public ImmutablePoint(double x, double y) { X = x; Y = y; }

    public override double Area      => 0;
    public override double Perimeter => 0;

    public override string Describe()
        => $"Point({X}, {Y})";   // Override optional virtual method
}

Shape s = new Circle(5);
Console.WriteLine(s.Describe());   // Circle: area=78.54, perimeter=31.42
```

## `record`: Immutable Value-Semantics Types

Records are C# 9's answer to a common problem: data-carrying objects where equality should be based on values, not identity. With a regular class, two `Person` objects with the same name and age are not equal by default (reference equality). With a record, they are:

```csharp
// Positional record: one line creates constructor, properties, Equals, GetHashCode, ToString
record Point(double X, double Y);

var p1 = new Point(1.0, 2.0);
var p2 = new Point(1.0, 2.0);
var p3 = new Point(3.0, 4.0);

Console.WriteLine(p1 == p2);   // True  — value equality
Console.WriteLine(p1 == p3);   // False
Console.WriteLine(p1);         // Point { X = 1, Y = 2 } — built-in ToString

// Records are immutable by default — but you can "update" with 'with'
var p4 = p1 with { Y = 99.0 };   // New record, X copied from p1
Console.WriteLine(p4);            // Point { X = 1, Y = 99 }
Console.WriteLine(p1);            // Point { X = 1, Y = 2 } — unchanged
```

The `with` expression is unique to records: it creates a copy with specified properties changed, leaving the original untouched. This is the **non-destructive mutation** pattern — extremely useful in functional-style code.

## Records vs Classes: When to Use Which

```csharp
// Record — use for: data, DTOs, return values, immutable config, value-semantics
record UserDto(int Id, string Name, string Email);

// Class — use for: objects with identity, mutable state, services, controllers
class UserService
{
    private readonly List<UserDto> _users = new();

    public void AddUser(UserDto user) => _users.Add(user);
    public UserDto? FindById(int id)  => _users.FirstOrDefault(u => u.Id == id);
}

var service = new UserService();
service.AddUser(new UserDto(1, "Alice", "alice@example.com"));
service.AddUser(new UserDto(2, "Bob",   "bob@example.com"));

var found = service.FindById(1);
Console.WriteLine(found);   // UserDto { Id = 1, Name = Alice, Email = alice@example.com }

// Records can have methods too
record Temperature(double Celsius)
{
    public double Fahrenheit => Celsius * 9.0 / 5.0 + 32;
    public bool IsFreezing   => Celsius <= 0;
    public override string ToString() => $"{Celsius}°C ({Fahrenheit:F1}°F)";
}

var t = new Temperature(100);
Console.WriteLine(t);              // 100°C (212.0°F)
Console.WriteLine(t.IsFreezing);   // False
```

## `record struct`: Value-Type Records

C# 10 added `record struct` — the same value-semantics convenience but as a stack-allocated struct:

```csharp
record struct Rgb(byte R, byte G, byte B)
{
    public static readonly Rgb Red   = new(255, 0, 0);
    public static readonly Rgb Green = new(0, 255, 0);
    public static readonly Rgb Blue  = new(0, 0, 255);

    public Rgb Mix(Rgb other) => new(
        (byte)((R + other.R) / 2),
        (byte)((G + other.G) / 2),
        (byte)((B + other.B) / 2)
    );
}

var purple = Rgb.Red.Mix(Rgb.Blue);
Console.WriteLine(purple);   // Rgb { R = 127, G = 0, B = 127 }
```

Use `record struct` for small, frequently created data values where you want both value semantics and stack allocation.

## Encapsulation and Access Modifiers

C# has five access modifiers:

| Modifier | Accessible from |
|---|---|
| `public` | Anywhere |
| `private` | This class only |
| `protected` | This class and derived classes |
| `internal` | This assembly (project) only |
| `protected internal` | This assembly OR derived classes |
| `private protected` | This class and derived classes within this assembly |

The default is `private` for class members, `internal` for top-level types. Prefer the most restrictive level that works — it makes code easier to reason about and refactor.

```csharp
class BankAccount
{
    private decimal _balance;               // Only this class
    protected string OwnerId { get; }       // This class + subclasses
    public string AccountNumber { get; }    // Everyone

    internal void ReconcileWithBank() { }   // Only within this project

    public BankAccount(string ownerId, string accountNumber)
    {
        OwnerId       = ownerId;
        AccountNumber = accountNumber;
        _balance      = 0;
    }

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be positive");
        _balance += amount;
    }

    public bool Withdraw(decimal amount)
    {
        if (amount > _balance) return false;
        _balance -= amount;
        return true;
    }

    public decimal Balance => _balance;
}

var account = new BankAccount("user-1", "ACC-001");
account.Deposit(500);
Console.WriteLine(account.Withdraw(200));   // True
Console.WriteLine(account.Balance);         // 300
// account._balance = 9999;                // Compile error: private
```
