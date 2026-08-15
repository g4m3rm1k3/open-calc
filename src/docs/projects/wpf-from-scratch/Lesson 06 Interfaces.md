# Lesson 06: Interfaces

**What you will build:** You will write isolated contracts that guarantee specific behaviors, and classes that fulfill those contracts. You will build a system that can process completely unrelated objects purely based on the promises they make. This proves how C# enforces strict behavioral agreements, solving the problem of how to write flexible code that doesn't need to know the exact identity of the objects it works with. Every example is discarded after it proves its point.

**What you need to know first:** Previous lessons on Classes and Methods.

**Terms introduced in this lesson:**
- **Interface** — a strict contract that defines a set of empty members (methods, properties) that a class promises to implement. *Why it exists:* To allow unrelated classes to guarantee they support the same behaviors, enabling other code to rely on those behaviors safely.
- **Contract** — an agreement enforced by the compiler. *Why it exists:* To prevent runtime errors by ensuring that if an object claims to do something, the required methods are guaranteed to exist.
- **Coding to an interface** — writing methods that declare their parameters as an interface type rather than a specific class type. *Why it exists:* To decouple code from specific implementations, making systems infinitely extensible without rewriting existing logic.

**Objects and methods used:**
- **System.IComparable<T> / CompareTo**
  - *What it is:* A standard .NET interface that defines a generalized type-specific comparison method.
  - *Implementation:* `int CompareTo(T? other);`
  - *Its use:* To allow instances of a class to be sorted or compared against one another.
- **System.ComponentModel.INotifyPropertyChanged / PropertyChanged**
  - *What it is:* A standard .NET interface used to notify external listeners that a property value has changed.
  - *Implementation:* `event PropertyChangedEventHandler? PropertyChanged;`
  - *Its use:* The fundamental contract WPF requires to know when to update the UI automatically.

---

## Concept Unit: What an Interface Is

### The Problem
You have different kinds of objects (like a `Book` and a `Machine`) that share no logical relationship. They cannot share a base class because a machine is not a book. However, you want to guarantee that both provide a uniform way to describe themselves, so that other parts of your code can interact with them reliably.

### The New Code
```csharp
interface IDescribable 
{ 
    string Describe(); 
}

class Book : IDescribable 
{
    public string Title { get; set; } = "Untitled";

    public string Describe() 
    {
        return $"Book: {Title}";
    }
}

class Machine : IDescribable 
{
    public string ModelNumber { get; set; } = "Unknown";

    public string Describe() 
    {
        return $"Machine: {ModelNumber}";
    }
}
```

### Mechanical Walkthrough
- `interface IDescribable`: Declares a new interface. By standard C# convention, interface names always start with a capital 'I'. The interface itself contains no executable code.
- `string Describe();`: The signature of the method. Notice there are no curly braces containing logic, and no access modifier like `public`. The interface only dictates *what* must exist, not *how* it works.
- `class Book : IDescribable`: The colon syntax indicates that `Book` is signing the `IDescribable` contract. `Book` is now legally bound by the compiler to provide the members defined in the interface.
- `public string Describe()`: The actual implementation provided by `Book`. It must be explicitly marked `public`, and its return type and name must perfectly match the interface's signature. If `Book` omitted this method, the compiler would refuse to build the program.

### CS Lens
Polymorphism via contracts. You define the "shape" of an interaction independent of the underlying data structure. It operates exactly like a USB port: your computer doesn't care if a keyboard, a mouse, or a fan is plugged in. It only cares that the device correctly speaks the USB protocol. 

### SE Lens
Interface Segregation. By defining an interface, you force classes to adhere to a specific, narrow behavior. The alternative not chosen is "duck typing" (hoping the method exists at runtime and failing if it doesn't), which sacrifices safety. Another alternative is forcing a shared base class, which creates rigid, illogical taxonomies (e.g., forcing `Book` and `Machine` to inherit from `DescribableThing`).

### Run It Yourself
Create a new .NET 8 console project: `dotnet new console -n InterfacesDemo`. Replace `Program.cs` with the code above. Add `Console.WriteLine(new Book().Describe());` at the bottom. Run `dotnet run`. The exact expected output is:
`Book: Untitled`

---

## Concept Unit: Why Interfaces Over Inheritance

### The Problem
A class in C# can only inherit from exactly one base class. But what if a class needs to participate in multiple different systems? For example, a `Book` needs to be describable to our custom logging system, but it also needs to be comparable so that .NET's built-in sorting algorithms know how to order it.

### The New Code
```csharp
using System;

interface IDescribable 
{ 
    string Describe(); 
}

class Book : IDescribable, IComparable<Book>
{
    public string Title { get; set; } = "";
    public int PageCount { get; set; }

    public string Describe() 
    {
        return $"Book: {Title}";
    }

    public int CompareTo(Book? other)
    {
        if (other == null) return 1;
        return this.PageCount.CompareTo(other.PageCount); // Compares ints natively
    }
}
```

### Mechanical Walkthrough
- `using System;`: Brings the core `System` namespace into scope, which contains the `IComparable<T>` interface.
- `class Book : IDescribable, IComparable<Book>`: A class can implement multiple interfaces, separated by commas. `Book` is now promising to fulfill two entirely separate contracts simultaneously.
- `IComparable<Book>`: A standard interface built into .NET. The `<Book>` syntax (generics) tells the interface what specific type it will be compared against.
- `public int CompareTo(Book? other)`: The specific method required by the `IComparable<Book>` contract. It provides the logic for determining whether this book is "greater than" or "less than" another book, based on `PageCount`.

### CS Lens
Multiple Inheritance of Types. While C# absolutely forbids multiple inheritance of state (you cannot inherit from two classes), it fully supports multiple inheritance of behavior (you can implement infinite interfaces). This mirrors capability-based security: an entity is defined by the discrete capabilities it proves it possesses.

### SE Lens
Composition of Behaviors. The alternative not chosen is deep, sprawling inheritance hierarchies. Deep hierarchies become incredibly brittle because a change at the root breaks everything below it. Interfaces allow you to mix and match capabilities horizontally across completely unrelated classes. The cost is that you must write the implementation code for the interface in every class that signs the contract; you cannot inherit the implementation.

### Run It Yourself
Paste the code into your console project. Add this to the bottom:
```csharp
var shortBook = new Book { Title = "Short", PageCount = 100 };
var longBook = new Book { Title = "Long", PageCount = 500 };
Console.WriteLine(shortBook.CompareTo(longBook)); // Outputs -1 (less than)
```
Run `dotnet run`. The exact expected output is:
`-1`

---

## Concept Unit: Coding to the Interface

### The Problem
You want to write a method that takes an object and prints its description. You do not want to write one method for `Book`, another identical method for `Machine`, and a third for every new class you invent in the future.

### The New Code
```csharp
using System;

interface IDescribable { string Describe(); }

class Book : IDescribable { public string Describe() => "A book."; }
class Machine : IDescribable { public string Describe() => "A machine."; }
class Rock { /* Does not implement IDescribable */ }

class Program
{
    static void PrintDescription(IDescribable item)
    {
        Console.WriteLine(item.Describe());
    }

    static void Main()
    {
        Book myBook = new Book();
        Machine myMachine = new Machine();
        Rock myRock = new Rock();

        PrintDescription(myBook);    // Works
        PrintDescription(myMachine); // Works
        
        // PrintDescription(myRock); // If uncommented, this causes a compiler error
    }
}
```

### Mechanical Walkthrough
- `PrintDescription(IDescribable item)`: The method's parameter declares an interface type, not a specific concrete class. The method is entirely blind to whether `item` is a `Book` or a `Machine`. It relies solely on the contractual guarantee that `item` has a `Describe()` method.
- `PrintDescription(myBook)`: The `Book` instance is passed in. Because `Book` explicitly implements `IDescribable`, the compiler validates the contract and allows this.
- `// PrintDescription(myRock)`: `Rock` does not implement `IDescribable`. The compiler enforces the contract strictly: because `Rock` didn't sign the paperwork, it is rejected, preventing a potential runtime crash.

### CS Lens
Liskov Substitution Principle (the 'L' in SOLID). If a function expects an interface, any object implementing that interface can be substituted into the function without altering the correctness of the program.

### SE Lens
Loose Coupling. The alternative is tight coupling, where `PrintDescription` would need strict, explicit knowledge of every class it might ever be asked to print. By coupling to the interface instead of the class, `PrintDescription` never needs to be modified, even if you add 100 new describable classes to your software later. The cost is slightly more indirection when reading the code: looking at `PrintDescription`, you don't immediately know exactly what code will run until runtime.

### Run It Yourself
Paste the code into your console project. Run `dotnet run`. The exact expected output is:
```text
A book.
A machine.
```

---

## Concept Unit: INotifyPropertyChanged as a Preview

### The Problem
When you build a user interface, the UI needs to know when the underlying data changes so it can redraw itself. How does a generic UI framework written by Microsoft know how to listen to your custom, newly invented classes?

### The New Code
```csharp
using System.ComponentModel;

// This is the actual .NET interface declaration hiding inside the framework:
// public interface INotifyPropertyChanged
// {
//     event PropertyChangedEventHandler? PropertyChanged;
// }

class UserSettings : INotifyPropertyChanged
{
    // We will implement this fully in Lesson 17.
    // For now, this exact line satisfies the compiler's requirement for the contract.
    public event PropertyChangedEventHandler? PropertyChanged;

    private string _theme = "Dark";
    public string Theme 
    {
        get { return _theme; }
        set 
        {
            _theme = value;
            // This is where we will eventually notify WPF that "Theme" changed.
        }
    }
}
```

### Mechanical Walkthrough
- `using System.ComponentModel;`: Brings the specific namespace containing `INotifyPropertyChanged` into scope.
- `INotifyPropertyChanged`: The non-negotiable interface that WPF specifically looks for. If your class doesn't implement this, WPF's data binding engine cannot detect changes automatically.
- `public event PropertyChangedEventHandler? PropertyChanged;`: The single member required by the interface contract. It is an `event` (a concept we will cover later) that external code—like the WPF framework—can hook into.
- The constraint: The Microsoft engineers who wrote WPF have never seen your `UserSettings` class. They coded WPF to look exclusively for objects that implement `INotifyPropertyChanged`. If your class signs that contract, WPF knows exactly how to talk to it.

### CS Lens
The Observer Pattern. An object maintains a list of dependents (observers) and notifies them automatically of any state changes. Interfaces standardize the "subscription" mechanism so that the observer and the observed don't need to know each other's underlying types.

### SE Lens
Framework Integration. Frameworks dictate contracts. You don't tell WPF how to update the screen; WPF tells you what interface your classes must implement, and it handles the rest. The real tradeoff is the cost of boilerplate: your data classes become cluttered with framework-specific interface implementations instead of remaining purely focused on your business logic.

### Run It Yourself
This code proves compilation but does not produce console output. Paste it into your project and run `dotnet build` to confirm it compiles perfectly.

---

## Connect the Pieces
A single trace of the interface lifecycle: We define an abstract contract (`IDescribable`), a concrete class explicitly signs it (`class Book : IDescribable`), the class writes the physically required method (`public string Describe()`), and a completely separate system consumes the object purely through the contract (`PrintDescription(IDescribable item)`), totally blind to the fact that it was holding a `Book`.

## What Breaks Without This
Attempting to treat an object as an interface it hasn't explicitly implemented will fail, even if it happens to have methods with the exact right names. The compiler demands formal agreement.

```csharp
interface IDescribable { string Describe(); }
class Alien { public string Describe() => "I am alien."; }

// In Main:
Alien x = new Alien();
IDescribable d = (IDescribable)x; // Fails
```
**The exact compiler error:**
`error CS0030: Cannot convert type 'Alien' to 'IDescribable'`

**To restore it:**
Add `: IDescribable` to the `Alien` class declaration.

## Exercises
1. Create an interface `IChargeable` containing a `void Charge(int amount);` method. Implement it on a `Phone` class and an `ElectricCar` class.
2. Write a method `static void PlugIn(IChargeable device)` that calls `Charge(100)` on whatever is passed in. Pass both a `Phone` instance and an `ElectricCar` instance to it.
3. Create a `CoffeeMug` class. Attempt to pass it to `PlugIn` and observe the exact compiler error preventing it.

## Definition of Done
- [ ] You can define what an interface is and how it acts as a contract.
- [ ] You can make a class implement a custom interface.
- [ ] You understand why a method would accept an interface as a parameter instead of a concrete class.
- [ ] You can explain Interfaces out loud, in your own words, to someone who hasn't read this lesson.
