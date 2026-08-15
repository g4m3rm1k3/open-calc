# Lesson 02: Classes and Objects

**What you will build:** You will build isolated programs that group related data and actions together under custom names. This proves that you are not limited to the primitive data types C# provides; you can invent your own types to represent complex entities in memory. The transferable problem this solves is data organization: instead of passing dozens of loose variables around a large application, you pass a single cohesive object that manages its own state and rules.

**What you need to know first:** Lesson 01.

**Terms introduced in this lesson:**
- **Class** — a definition of a custom data type. *Why it exists:* to describe the shape and behavior of a complex entity before it actually exists in memory.
- **Object / Instance** — a concrete block of memory created from a class. *Why it exists:* to hold the actual data for one specific entity while the program runs.
- **Field** — a variable declared directly inside a class. *Why it exists:* to store the permanent data that an object remembers between actions.
- **Constructor** — a special block of code that runs exactly once when an object is created. *Why it exists:* to guarantee that an object starts its life in a valid, fully configured state.
- **Heap** — a region of the computer's memory where objects live. *Why it exists:* to store data that must survive beyond the end of the method that created it.
- **Method** — a named block of code attached to a class. *Why it exists:* to define the actions that objects of this class know how to perform.
- **Access Modifier** — a keyword (`public`, `private`) that controls what code is allowed to see a field or method. *Why it exists:* to prevent outside code from breaking an object by tampering with its internal data.

**Objects and methods used:**
- **System.Console / WriteLine**
  - *What it is:* A built-in command that prints text to the screen.
  - *Implementation:* `public static void WriteLine(string value)`
  - *Its use:* We use it to prove that our objects hold the correct data and execute methods as expected.

---

## Concept Unit: A Class as a Blueprint

### The Problem
When you write software, you often need to represent concepts that have multiple pieces of data. If you want to track a person, you need a name, an age, and an email address. If you keep these as separate variables (`string name1`, `int age1`, `string email1`), keeping track of which variable belongs to which person quickly becomes an unmanageable mess. You need a way to declare a single new concept that contains all three pieces of data.

### The New Code
```csharp
class Person
{
    public string Name = "Unknown";
    public int Age = 0;
}

Person p1 = new Person();
p1.Name = "Alice";

Person p2 = new Person();
p2.Name = "Bob";

Console.WriteLine(p1.Name);
Console.WriteLine(p2.Name);
```

### Mechanical Walkthrough
- `class Person { ... }`: This defines a new type named `Person`. It does not create a person in memory. It tells the C# compiler, "If I ever ask for a `Person`, this is what it looks like." Without this, the compiler will reject the word `Person`.
- `public string Name = "Unknown";`: This is a field. Every time a `Person` object is created, it will have its own piece of memory to hold a string, defaulting to "Unknown". 
- `Person p1`: This creates a variable named `p1` that is allowed to point to a `Person` object. It does not create the object itself.
- `new Person()`: This command asks the computer to allocate fresh memory on the heap large enough to hold all the fields defined in the `Person` class. It produces an actual object.
- `=`: The assignment operator connects the variable on the left (`p1`) to the object on the right (`new Person()`).
- `p1.Name = "Alice";`: The `.` (dot) operator tells the program to follow the variable `p1` to its object in memory, look inside it for the field `Name`, and store "Alice" there.
- `new Person()` (second time): This allocates a completely separate block of memory. Without this, `p2` would have nowhere to point, or you would just be pointing two variables at the same object.

### CS Lens
A class is a user-defined compound data type. The hardware CPU only understands raw bytes. Primitive types like integers give meaning to 4 bytes. A class gives meaning to a larger block of memory by slicing it into named regions (fields). This is identical in concept to a database table schema defining columns, while objects are the individual rows of data inserted into that table.

### SE Lens
The engineering principle is Encapsulation of Data. The alternative not chosen is parallel arrays: having one list for names, one list for ages, and relying on the index matching across lists. Parallel arrays cost mental overhead; if you sort one array and forget to sort the other, the data is corrupted. Grouping data into a class ensures the pieces are physically bound together in memory and cannot drift apart.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n ClassDemo`.
2. Open the `Program.cs` file.
3. Replace all contents with the code above.
4. Run `dotnet run`.
5. The exact expected output is:
Alice
Bob

---

## Concept Unit: `new` and the Constructor

### The Problem
If you rely on assigning fields one by one after creating an object (`p1.Name = "Alice"; p1.Age = 30;`), you leave open the possibility that a programmer will forget to set a required field. You need a way to demand that certain data is provided at the exact moment the object is brought into existence, so that it is never in an incomplete state.

### The New Code
```csharp
class Person
{
    public string Name;
    public int Age;

    public Person(string initialName, int initialAge)
    {
        Name = initialName;
        Age = initialAge;
    }
}

Person p1 = new Person("Alice", 30);
Person p2 = new Person("Bob", 25);

Console.WriteLine($"{p1.Name} is {p1.Age}");
Console.WriteLine($"{p2.Name} is {p2.Age}");
```

### Mechanical Walkthrough
- `public Person(string initialName, int initialAge)`: This is the constructor. It is a block of code that shares the exact name of the class. It is the initialization logic for the object.
- `Name = initialName;`: This takes the value passed into the constructor (`initialName`) and permanently stores it in the object's `Name` field. Without this step, the field would remain empty, even though the value was provided.
- `new Person("Alice", 30)`: Because the class now has a constructor that requires two parameters, `new Person()` is no longer valid. The compiler forces the caller to provide the required data during creation. This guarantees the object is born with its data.

### CS Lens
The constructor is the initialization phase of a state machine. It transitions memory from raw, unformatted bytes into a valid state that obeys the rules of the program. This is similar to formatting a hard drive before you can save files to it: the raw storage exists, but it must be prepared according to a strict structure before it is usable.

### SE Lens
The engineering principle is Invariant Enforcement. The alternative not chosen is an `Initialize()` method that must be called after `new`. The tradeoff of the alternative is temporal coupling: the caller must remember to call `Initialize()` before using the object. By using a constructor, we make it impossible for the caller to forget. The cost is that we must know all required data at the exact moment we want to create the object.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n ConstructorDemo`.
2. Open the `Program.cs` file.
3. Replace all contents with the code above.
4. Run `dotnet run`.
5. The exact expected output is:
Alice is 30
Bob is 25

---

## Concept Unit: Instance Methods and `this`

### The Problem
Data rarely exists just to be stored; it exists to be acted upon. If you want to print a person's details, you could write that logic in your main program. But if you need to print a person's details in fifty different places, you will duplicate that logic fifty times. You need a way to attach behaviors directly to the data, so the object knows how to operate on itself.

### The New Code
```csharp
class Person
{
    public string Name;

    public Person(string name)
    {
        this.Name = name;
    }

    public void Describe()
    {
        Console.WriteLine($"I am {this.Name}");
    }
}

Person p1 = new Person("Alice");
Person p2 = new Person("Bob");

p1.Describe();
p2.Describe();
```

### Mechanical Walkthrough
- `public Person(string name)`: The constructor parameter is now named `name`, which exactly matches the field `Name` in concept, and would match in casing if we didn't capitalize fields.
- `this.Name = name;`: The `this` keyword is a special reference that means "the specific object currently executing this code." It distinguishes the field belonging to the object (`this.Name`) from the variable passed into the constructor (`name`). Without `this`, if the names match exactly, the compiler assumes you mean the closest variable, and the object's field will never be updated.
- `public void Describe()`: This is an instance method. It is a block of code attached to the `Person` class. The word `void` means this action does not hand any data back when it finishes.
- `p1.Describe();`: This tells the program to execute the `Describe` method. Crucially, it executes it in the context of the `p1` object. When the method runs, `this` will point to `p1`.
- `p2.Describe();`: This executes the same method, but now `this` points to `p2`. The method automatically uses the correct data.

### CS Lens
An instance method is a subroutine with an invisible parameter. When you call `p1.Describe()`, the computer silently passes the memory address of `p1` into the method as the `this` reference. This is how the same block of machine code can operate on millions of different objects without getting confused about whose data to read.

### SE Lens
The engineering principle is Cohesion. The alternative not chosen is a standalone function `DescribePerson(Person p)`. The real tradeoff is that keeping the method inside the class makes the class larger and more complex, but it makes the rest of the application simpler because the behavior travels with the data. If the shape of the data changes later, you only have to update the methods inside the class.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n MethodDemo`.
2. Open the `Program.cs` file.
3. Replace all contents with the code above.
4. Run `dotnet run`.
5. The exact expected output is:
I am Alice
I am Bob

---

## Concept Unit: `public` vs `private`

### The Problem
If every piece of data inside an object is available to the entire program, any part of the program can change it. If you have a `BankAccount` object, you do not want random code to reach in and change the `Balance` field to a million. You need a way to lock down internal data, forcing the outside world to interact with the object only through approved methods that can enforce rules.

### The New Code
```csharp
class BankAccount
{
    private decimal balance;

    public BankAccount(decimal initialDeposit)
    {
        this.balance = initialDeposit;
    }

    public void PrintBalance()
    {
        Console.WriteLine($"Balance is: {this.balance}");
    }
}

BankAccount account = new BankAccount(100.00m);
account.PrintBalance();
```

### Mechanical Walkthrough
- `private decimal balance;`: The `private` keyword declares that this field is completely invisible to any code that is not inside the `BankAccount` class. It acts as an absolute barrier.
- `this.balance = initialDeposit;`: This code is inside the `BankAccount` constructor, so it is allowed to touch the `private` field.
- `public void PrintBalance()`: The `public` keyword means this method can be called by anyone. 
- `Console.WriteLine($"Balance is: {this.balance}");`: Because `PrintBalance` is inside the class, it can read the `private` field and safely share the information with the outside world.
- `account.PrintBalance();`: The outside code successfully triggers the behavior without ever touching the raw data.

### CS Lens
Access modifiers are a compiler-enforced contract. At runtime, when the program is executing in the CPU, `private` does not exist—the memory is just memory. But during compilation, the compiler acts as a strict referee, refusing to build the program if it catches outside code attempting to access memory declared as private. This is a purely structural safeguard.

### SE Lens
The engineering principle is Information Hiding. The alternative not chosen is making everything public and adding a comment saying `// Do not modify this directly`. The tradeoff is that private fields require you to write extra public methods just to read or safely update the data, which increases the amount of code. However, it prevents catastrophic bugs where external code accidentally corrupts an object's state, making the system vastly more stable as it grows.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n PrivateDemo`.
2. Open the `Program.cs` file.
3. Replace all contents with the code above.
4. Run `dotnet run`.
5. The exact expected output is:
Balance is: 100.00

---

## Connect the Pieces
Consider the flow of the value `100.00m`. It starts outside the class as an argument provided to the `new` keyword. The `new` keyword passes it into the constructor. The constructor binds it to the object by saving it into a `private` field using `this`. The value rests securely in the object's heap memory. Finally, an outside caller invokes a `public` instance method on the object, which reaches into the `private` field and prints the value to the screen.

## What Breaks Without This
If we try to bypass the public method and read the private field directly from the outside, the compiler will stop us.

Change the final code example by adding one line at the bottom:
```csharp
BankAccount account = new BankAccount(100.00m);
account.PrintBalance();
Console.WriteLine(account.balance);
```

When you attempt to run this, you will receive a compiler error:
`error CS0122: 'BankAccount.balance' is inaccessible due to its protection level`

To fix this, delete the failing line. You must respect the object's boundaries.

## Exercises
1. Modify the `Person` class from the third unit to take a `private int age` in its constructor. Update the `Describe` method to print both the name and the age. Verify it works.
2. Try to change the `Age` field of your `Person` object directly from the main program block (e.g., `p1.age = 50;`). Observe the compiler error.
3. Add a new public method to `BankAccount` called `Deposit(decimal amount)`. Inside it, add the amount to `this.balance`. Call `Deposit` from your main program, then call `PrintBalance` again to prove the internal state changed.

## Definition of Done
- You can create a class and instantiate it using `new`.
- You can write a constructor to guarantee required data is provided.
- You can write an instance method that uses `this` to operate on the object's own data.
- You understand the difference between `public` and `private`.
- You can explain classes and objects out loud, in your own words, to someone who hasn't read this lesson.
