# Classes and Objects: Building Your Own Types

So far you've used types that C# provides — `int`, `string`, `bool`. But the real power of C# is the ability to define **your own types** using **classes**. A class lets you bundle related data and behaviour together into a single, named thing.

C# is fundamentally an object-oriented language — most code you write lives inside a **class**. But C# has evolved beyond classical OOP. C# 9 introduced **records**: immutable, value-semantics types defined in one line that replace the boilerplate-heavy classes that OOP traditionally demands for data. Understanding both the classical and modern approaches is essential to reading real C# codebases.

## What Is a Class?

Think of a class as a **blueprint** or a template. A blueprint for a house describes how many rooms it has, what colour it is, and what you can do in it. The actual house built from that blueprint is an **object** (also called an **instance**).

You can build many houses from the same blueprint — they all follow the same structure, but each one has its own values.

```csharp
// This is the BLUEPRINT (class definition)
class Dog
{
    // Data the blueprint describes (called fields or properties)
    public string Name;
    public string Breed;
    public int Age;

    // Behaviour the blueprint describes (called methods)
    public void Bark()
    {
        Console.WriteLine($"{Name} says: Woof!");
    }

    public string GetDescription()
    {
        return $"{Name} is a {Age}-year-old {Breed}.";
    }
}

// These are OBJECTS (instances) built from the blueprint using 'new'
Dog rex   = new Dog();
Dog buddy = new Dog();

// Each object has its own copy of the data
rex.Name  = "Rex";
rex.Breed = "Labrador";
rex.Age   = 3;

buddy.Name  = "Buddy";
buddy.Breed = "Poodle";
buddy.Age   = 5;

// They share the same behaviour (methods), but each uses its own data
rex.Bark();                          // Rex says: Woof!
buddy.Bark();                        // Buddy says: Woof!
Console.WriteLine(rex.GetDescription());   // Rex is a 3-year-old Labrador.
Console.WriteLine(buddy.GetDescription()); // Buddy is a 5-year-old Poodle.
```

`rex` and `buddy` are two completely separate objects — changing `rex.Name` does not affect `buddy.Name`.

## Constructors: Setting Up an Object at Creation

In the example above, you had to set `Name`, `Breed`, and `Age` separately after creating the Dog. A **constructor** is a special method that runs *at the moment you create an object*, so you can provide the data upfront:

```csharp
class Dog
{
    public string Name;
    public string Breed;
    public int Age;

    // Constructor: has the same name as the class, no return type
    // Parameters are the information you must provide when creating a Dog
    public Dog(string name, string breed, int age)
    {
        // 'this' refers to the object being created
        // We're taking the values passed in and storing them in the object
        Name  = name;
        Breed = breed;
        Age   = age;
    }

    public void Bark()
    {
        Console.WriteLine($"{Name} says: Woof!");
    }
}

// Now you MUST provide name, breed, and age when creating a Dog
var rex   = new Dog("Rex",   "Labrador", 3);
var buddy = new Dog("Buddy", "Poodle",   5);

rex.Bark();     // Rex says: Woof!
buddy.Bark();   // Buddy says: Woof!

// new Dog();   // Compile error — the constructor requires 3 arguments
```

Constructors make sure an object always starts in a valid state. You can't forget to set the name — it's required by the constructor.

## Properties: Controlled Access to Data

In the examples above, `Name`, `Breed`, and `Age` are **fields** — raw variables directly on the object. Anyone can read or write them freely. **Properties** give you control over this:

```csharp
class BankAccount
{
    // The _balance field is PRIVATE — only code inside this class can touch it
    // Convention: private fields start with an underscore
    private decimal _balance;

    // The Balance PROPERTY is PUBLIC — anyone can read it
    // But there's no 'set' — nobody outside can write it directly
    public decimal Balance
    {
        get { return _balance; }   // get: code that runs when someone reads Balance
    }

    // The AccountNumber can be read from outside but only set in the constructor
    public string AccountNumber { get; private set; }

    public BankAccount(string accountNumber)
    {
        AccountNumber = accountNumber;
        _balance      = 0;
    }

    // To change _balance, you must go through these controlled methods
    public void Deposit(decimal amount)
    {
        if (amount <= 0)
        {
            Console.WriteLine("Deposit amount must be positive.");
            return;
        }
        _balance += amount;
        Console.WriteLine($"Deposited {amount:C}. New balance: {_balance:C}");
    }

    public bool Withdraw(decimal amount)
    {
        if (amount > _balance)
        {
            Console.WriteLine("Insufficient funds.");
            return false;   // false = failed
        }
        _balance -= amount;
        Console.WriteLine($"Withdrew {amount:C}. New balance: {_balance:C}");
        return true;   // true = success
    }
}

var account = new BankAccount("ACC-001");
account.Deposit(500m);     // Deposited £500.00. New balance: £500.00
account.Withdraw(200m);    // Withdrew £200.00. New balance: £300.00
account.Withdraw(400m);    // Insufficient funds.

Console.WriteLine(account.Balance);        // 300
// account._balance = 9999;  // Compile error: _balance is private
// account.Balance  = 9999;  // Compile error: Balance has no public setter
```

This is **encapsulation** — one of the core ideas of object-oriented programming. The object protects its own data and only allows changes through controlled methods. The bank account can ensure the balance never goes negative by checking inside `Withdraw`.

## Auto-Properties: The Shorthand

Writing a private field and a property that just reads/writes it is so common that C# has a shortcut. An **auto-property** tells the compiler to create the private field automatically:

```csharp
class Person
{
    // Auto-property: compiler creates the backing field for you
    // { get; set; } means anyone can read and write it
    public string Name  { get; set; }

    // { get; private set; } means anyone can read, but only this class can write
    public int Age { get; private set; }

    // { get; } means read-only — can only be set in the constructor
    public string Id { get; }

    public Person(string id, string name, int age)
    {
        Id   = id;    // Can set read-only property in constructor
        Name = name;
        Age  = age;
    }

    public void HaveBirthday()
    {
        Age++;   // This class can write Age internally
        Console.WriteLine($"Happy birthday {Name}! You are now {Age}.");
    }
}

var person = new Person("P001", "Alice", 30);
Console.WriteLine(person.Name);   // Alice
Console.WriteLine(person.Age);    // 30

person.Name = "Alicia";           // OK — Name has public set
// person.Age = 25;               // Compile error — Age has private set
person.HaveBirthday();            // Happy birthday Alicia! You are now 31.
```

## Default Property Values

Properties can have default values, so you don't always need to set everything in the constructor:

```csharp
class ServerConfig
{
    public string Host    { get; set; } = "localhost";   // Default value
    public int    Port    { get; set; } = 8080;
    public bool   UseTls  { get; set; } = false;
    public int    Timeout { get; set; } = 30;
}

// Using defaults — don't need to specify every property
var config = new ServerConfig();
Console.WriteLine($"{config.Host}:{config.Port}");   // localhost:8080

// Override just what you need using an object initializer
// (curly braces after 'new ServerConfig()' let you set properties)
var productionConfig = new ServerConfig
{
    Host   = "api.example.com",
    Port   = 443,
    UseTls = true,
    // Timeout stays 30 — the default
};

Console.WriteLine($"{productionConfig.Host}:{productionConfig.Port} TLS={productionConfig.UseTls}");
// api.example.com:443 TLS=True
```

## Multiple Constructors

A class can have more than one constructor, each accepting different arguments. C# picks the right one based on what you pass to `new`:

```csharp
class Rectangle
{
    public double Width  { get; }
    public double Height { get; }

    // Constructor 1: specify both dimensions
    public Rectangle(double width, double height)
    {
        Width  = width;
        Height = height;
    }

    // Constructor 2: a square — same value for both
    // ': this(side, side)' means "call Constructor 1 with side as both arguments"
    public Rectangle(double side) : this(side, side) { }

    // Constructor 3: default 1×1 square
    public Rectangle() : this(1.0) { }

    public double Area      => Width * Height;
    public double Perimeter => 2 * (Width + Height);

    public override string ToString() => $"Rectangle({Width} × {Height})";
}

Console.WriteLine(new Rectangle(4, 3).Area);       // 12  (4×3)
Console.WriteLine(new Rectangle(5).Area);           // 25  (5×5 square)
Console.WriteLine(new Rectangle().Perimeter);       // 4   (1×1 square)
```

## `static` Members: Belonging to the Class, Not an Object

Everything you've seen so far belongs to an **instance** — you need to create an object to use it. A `static` member belongs to the **class itself** and is shared across all objects (or doesn't need an object at all):

```csharp
class Counter
{
    // Static field: ONE copy shared by all Counter objects
    private static int _totalCreated = 0;

    // Instance field: each Counter object has its own
    public int Value { get; private set; }

    public Counter()
    {
        _totalCreated++;   // Every time a new Counter is created, increment the shared count
        Value = 0;
    }

    public void Increment() => Value++;

    // Static property: call as Counter.TotalCreated, no object needed
    public static int TotalCreated => _totalCreated;
}

var c1 = new Counter();
var c2 = new Counter();
var c3 = new Counter();

c1.Increment();
c1.Increment();
c2.Increment();

Console.WriteLine($"c1.Value = {c1.Value}");          // 2
Console.WriteLine($"c2.Value = {c2.Value}");          // 1
Console.WriteLine($"Total counters: {Counter.TotalCreated}");  // 3 — shared!
```

You've already been using static members: `Console.WriteLine` is a static method on the `Console` class. `Math.Sqrt` is static on `Math`. These don't need you to create a `new Console()` first — you call them directly on the class.

## Access Modifiers: Who Can See What

Every field, property, and method in a class has an **access modifier** that controls who can use it:

| Modifier | What can access it |
|---|---|
| `public` | Anyone, anywhere |
| `private` | Only code inside this class |
| `protected` | This class and classes that inherit from it |
| `internal` | Anywhere within this project (assembly) |

The most important rule: **start with private and only open things up when needed**. This keeps your objects in control of their own state.

```csharp
class Player
{
    private int _health = 100;      // Only Player code can touch this
    private int _maxHealth = 100;

    public string Name { get; }     // Anyone can read the name

    public int Health               // Anyone can read, nobody can write directly
    {
        get => _health;
    }

    public Player(string name)
    {
        Name = name;
    }

    public void TakeDamage(int amount)
    {
        // Private validation logic — caller doesn't need to worry about this
        _health = Math.Max(0, _health - amount);
        Console.WriteLine($"{Name} took {amount} damage. Health: {_health}/{_maxHealth}");
    }

    public void Heal(int amount)
    {
        _health = Math.Min(_maxHealth, _health + amount);
        Console.WriteLine($"{Name} healed {amount}. Health: {_health}/{_maxHealth}");
    }

    public bool IsAlive => _health > 0;
}

var player = new Player("Hero");
player.TakeDamage(30);     // Hero took 30 damage. Health: 70/100
player.TakeDamage(50);     // Hero took 50 damage. Health: 20/100
player.Heal(40);           // Hero healed 40. Health: 60/100
Console.WriteLine(player.IsAlive);  // True
// player._health = 9999;  // Compile error: _health is private
```

## `record`: A Shortcut for Simple Data Classes

Sometimes you just need a class to hold some data — no complex behaviour, no validation, just a container. Writing a full class with constructor, properties, and `ToString()` is repetitive. C# 9 introduced **records** for exactly this case:

```csharp
// One line creates: constructor, read-only properties, ToString, equality comparison
record Point(double X, double Y);

var p1 = new Point(3.0, 4.0);
var p2 = new Point(3.0, 4.0);
var p3 = new Point(1.0, 2.0);

Console.WriteLine(p1);         // Point { X = 3, Y = 4 } — automatic ToString
Console.WriteLine(p1 == p2);   // True  — records compare by value, not identity
Console.WriteLine(p1 == p3);   // False

// Records are immutable — you can't change X or Y after creation
// But you can make a modified copy with 'with'
var p4 = p1 with { Y = 99.0 };   // New Point, X stays 3, Y changes to 99
Console.WriteLine(p4);            // Point { X = 3, Y = 99 }
Console.WriteLine(p1);            // Point { X = 3, Y = 4 } — original unchanged
```

Use a **record** when you're storing data (a product, a point, a user from an API response). Use a **class** when the object has behaviour, manages state, or has identity (a bank account, a game player, a service).

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

