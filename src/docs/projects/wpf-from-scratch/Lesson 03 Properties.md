# Lesson 03: Properties

**What you will build:** You will build a set of small C# classes that protect their internal data. You will prove that raw variables can be corrupted from the outside, and you will build gates that intercept those changes to reject invalid data while remaining easy to read.

**What you need to know first:** Lesson 02: Classes and Objects.

**Terms introduced in this lesson:**
- **Field** — a variable declared directly in a class. *Why it exists:* To hold the physical memory for an object's state.
- **Property** — a method disguised as a field that controls access to data. *Why it exists:* To let outside code read or write data using simple assignment syntax, while allowing the class to intercept the operation.
- **Backing field** — a private field whose sole purpose is to hold the data for a property. *Why it exists:* Properties do not store data themselves; they need a physical variable to hold the value.
- **Auto-property** — a property where the compiler creates the backing field invisibly. *Why it exists:* To eliminate typing boilerplate code when a property needs no special logic.

**Objects and methods used:**
- **Console / WriteLine**
  - *What it is:* A method that prints text to the standard output stream.
  - *Implementation:* `public static void WriteLine(object? value)`
  - *Its use:* Displaying the current state of our objects to verify behavior.

---

## Concept Unit: The Vulnerability of Public Fields

### The Problem
When you expose a class's internal variables directly to the outside world, you lose control over what data goes into them. Any other part of the program can assign any value that fits the variable's type, even if that value makes no logical sense for your program.

### The New Code
```csharp
Player p = new Player();
p.Age = -500;
Console.WriteLine(p.Age);

class Player
{
    public int Age;
}
```

### Mechanical Walkthrough
- `public int Age;` declares a field. It allocates memory for an integer. Because it is `public`, code outside the `Player` class can access it directly. Without it, the object would have no memory to store an age.
- `p.Age = -500;` writes directly to that memory. There is no mechanism to stop or inspect this assignment. It succeeds, putting the object into an invalid state. Without encapsulation, any code can break the logical rules of the object.

### CS Lens
This is a violation of Encapsulation. An object should be responsible for its own integrity. When external code modifies an object's memory directly, the object cannot defend itself against bad data. This is analogous to a bank leaving a vault open and trusting customers to only take their own money.

### SE Lens
The alternative not chosen is making the field `private` and writing `GetAge()` and `SetAge(int value)` methods. The tradeoff of raw public fields is that you gain zero-overhead syntax (`p.Age = x`) but pay the cost of abandoning all validation and future flexibility. If you later decide `Age` needs validation, you must rewrite all external code calling it, breaking compatibility.

### Run It Yourself
Create a .NET 8 console project:
1. Open a terminal and run `dotnet new console -n Lesson03`
2. Run `cd Lesson03`
3. Replace the contents of `Program.cs` with the code above.
4. Run `dotnet run`.
Expected output:
```text
-500
```

---

## Concept Unit: Full Property with Backing Field

### The Problem
We need to intercept assignments to our data so we can reject invalid values, but we want to keep the simple syntax of a direct assignment (`p.Age = 25`) instead of forcing the caller to use methods (`p.SetAge(25)`).

### The New Code
```csharp
Player p = new Player();
p.Age = -500; // This will be rejected
Console.WriteLine(p.Age); 
p.Age = 25;   // This will be accepted
Console.WriteLine(p.Age);

class Player
{
    private int _age;

    public int Age
    {
        get 
        { 
            return _age; 
        }
        set 
        { 
            if (value >= 0)
            {
                _age = value;
            }
        }
    }
}
```

### Mechanical Walkthrough
- `private int _age;` is the backing field. It holds the actual integer in memory. It is `private`, so outside code cannot bypass the property to touch it. The underscore is a C# naming convention indicating a private field. Without it, the property would have nowhere to store the data.
- `public int Age` declares the property. Notice it has no parentheses; it looks like a field, but has a block `{ ... }`. This defines the public face of the data.
- `get { return _age; }` is the getter block. Whenever external code reads `p.Age`, this block executes and returns the value stored in `_age`. Without it, the property would be write-only.
- `set { ... }` is the setter block. Whenever external code assigns to `p.Age`, this block executes to handle the incoming assignment. Without it, the property would be read-only.
- `value` is a hidden, automatically provided variable inside the `set` block. It contains the new value the external code is trying to assign. Without this keyword, we wouldn't know what data to save.
- `if (value >= 0)` validates the incoming value. If the value is negative, the `set` block simply skips the assignment, protecting `_age`.

### CS Lens
A property is a facade. To the compiler, properties are actually compiled into `get_Age()` and `set_Age()` methods. C# hides this behind syntax sugar, merging the safety of methods with the readability of variable assignment. This acts like a network firewall inspecting packets: allowing safe data through and dropping the rest.

### SE Lens
The alternative not chosen is allowing the program to crash or behave unpredictably later because of negative age. The tradeoff here is boilerplate: you must type a field, a property, a get block, and a set block just to manage one piece of data safely. 

### Run It Yourself
1. Replace `Program.cs` with the code above.
2. Run `dotnet run`.
Expected output:
```text
0
25
```
*(The first output is 0 because the -500 assignment was ignored, and `int` defaults to 0).*

---

## Concept Unit: Auto-Properties

### The Problem
Often, an object needs to expose data without any validation logic at all. Writing a full property with a private backing field for a simple name or ID requires excessive typing, but using a public field is dangerous because we might need validation later.

### The New Code
```csharp
Player p = new Player();
p.Name = "Zelda";
Console.WriteLine(p.Name);

class Player
{
    public string Name { get; set; }
}
```

### Mechanical Walkthrough
- `public string Name { get; set; }` is an auto-property. It declares a property named `Name`. Without it, the class has no name data.
- `{ get; set; }` tells the compiler to automatically generate a hidden private backing field, and automatically write the standard `get { return _hiddenField; }` and `set { _hiddenField = value; }` code for you. Without this, you would have to write the backing field and accessors manually.
- `p.Name = "Zelda";` uses the auto-generated setter to store the string in the invisible backing field.

### CS Lens
This is an example of convention over configuration. The compiler recognizes the most common pattern for properties and provides a shorthand that behaves identically at runtime to the verbose version.

### SE Lens
The alternative not chosen is typing out the full backing field and getter/setter for every piece of data. The tradeoff is that you cannot see or debug the backing field directly, but the benefit is vastly cleaner code. If you ever need to add validation later, you can replace the auto-property with a full property without changing how outside code interacts with `Name`.

### Run It Yourself
1. Replace `Program.cs` with the code above.
2. Run `dotnet run`.
Expected output:
```text
Zelda
```

---

## Concept Unit: Read-Only Properties

### The Problem
Sometimes a class should allow external code to read a value, but only allow the class itself to change that value. We need an asymmetric gate where reading is public, but writing is restricted.

### The New Code
```csharp
Player p = new Player();
p.AddPoints(50);
Console.WriteLine(p.Score);

class Player
{
    public int Score { get; private set; } = 100;

    public void AddPoints(int points)
    {
        Score += points;
    }
}
```

### Mechanical Walkthrough
- `public int Score` makes the property visible to outside code.
- `get;` has no access modifier, so it inherits the property's `public` visibility. Anyone can read it.
- `private set;` changes the visibility of the setter. Only methods inside the `Player` class can assign a value to `Score`. Without this, external code could manipulate the score.
- `= 100;` is a property initializer. It sets the initial value of the hidden backing field when the object is created. Without it, the score would default to 0.
- `Score += points;` inside `AddPoints` works because the method is inside `Player`, satisfying the `private` restriction on the setter.

### CS Lens
This implements the principle of least privilege. External code is granted exactly the access it needs (reading) and nothing more. The object retains exclusive control over its internal state transitions. This is like a thermostat display: anyone can read the current temperature, but only the internal sensor can update it.

### SE Lens
The alternative not chosen is making the setter public and trusting callers not to cheat. The tradeoff of `private set` is that you must now write specific methods (like `AddPoints`) to allow controlled modification, increasing the total amount of code but drastically reducing the chance of bugs caused by external interference.

### Run It Yourself
1. Replace `Program.cs` with the code above.
2. Run `dotnet run`.
Expected output:
```text
150
```

---

## Connect the Pieces

Let's trace a value moving through a property gate. We create a `Player` object. External code attempts to write to a property: `p.Age = 25;`. 
1. The compiler sees the assignment and invokes the `set` block of the `Age` property.
2. The hidden variable `value` is populated with `25`.
3. The `set` block evaluates `if (value >= 0)`. Since 25 is greater than 0, it proceeds.
4. The assignment `_age = value` executes, storing 25 in the private backing field.
5. Later, `Console.WriteLine(p.Age)` is called.
6. The compiler invokes the `get` block of the `Age` property.
7. The `get` block reads `_age` (which holds 25) and returns it to the caller.

## What Breaks Without This

Without `private set`, external code can overwrite internal state it shouldn't touch.

**The Broken Code:**
```csharp
Player p = new Player();
p.Score = 999999; // Cheating!

class Player
{
    public int Score { get; private set; } = 100;
}
```

**The Error:**
```text
Program.cs(2,3): error CS0272: The property or indexer 'Player.Score' cannot be used in this context because the set accessor is inaccessible
```
*To fix it, you must remove the cheating line and call a public method on `Player` that controls how `Score` is modified.*

## Exercises
1. Create a `BankAccount` class with a `Balance` full property. Its setter should only allow changes if the new value is not negative.
2. Add an auto-property `AccountNumber` to `BankAccount` that can be read publicly but only set privately.
3. Try to assign a negative value to `Balance` from your `Program` and verify that the `Balance` remains 0.

## Definition of Done
- [ ] You understand that a property looks like a field but acts like a method.
- [ ] You can write a full property with a private backing field.
- [ ] You know when to use an auto-property to save time.
- [ ] You can restrict a property so it can be read publicly but modified only from inside the class.
- [ ] You can explain properties, getters, and setters out loud, in your own words, to someone who hasn't read this lesson.
