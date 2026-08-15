# Lesson 05: Inheritance and Polymorphism

**What you will build:** You will build a set of related data structures that share common behaviors while maintaining their own specialized logic. By proving that a program can treat different types uniformly through a shared ancestor, you will learn how to write generalized code that automatically adapts to the specific type of object it receives at runtime without requiring complex if/else checks.

**What you need to know first:** Lesson 04 (Classes and Objects).

**Terms introduced in this lesson:**
- **Inheritance** — a mechanism where a new class acquires the members (methods, properties) of an existing class. *Why it exists:* to eliminate redundant code by defining shared logic in one place.
- **Base class** — the class being inherited from. *Why it exists:* to serve as a common template for specialized classes.
- **Derived class** — the class that inherits from a base class. *Why it exists:* to add specific features or override behaviors while keeping the shared foundation.
- **Polymorphism** — the ability of different objects to respond in their own unique way to the same method call. *Why it exists:* to allow calling code to remain ignorant of an object's exact type, relying instead on a shared contract.

**Objects and methods used:**
- **virtual (keyword)**
  - *What it is:* A modifier indicating that a method or property can be replaced by a derived class.
  - *Implementation:* `public virtual void DoWork()`
  - *Its use:* Explicitly permitting subclasses to provide their own implementation of a member.
- **override (keyword)**
  - *What it is:* A modifier indicating that a method is replacing an inherited `virtual` method.
  - *Implementation:* `public override void DoWork()`
  - *Its use:* Changing the inherited behavior of a base class method within a derived class.
- **base (keyword)**
  - *What it is:* A reference to the base class implementation of the current object.
  - *Implementation:* `base.DoWork()`
  - *Its use:* Allowing an overridden method to still utilize the logic defined in its parent class.
- **sealed (keyword)**
  - *What it is:* A modifier that prevents a class from being inherited.
  - *Implementation:* `public sealed class FinalType`
  - *Its use:* Locking down a class's behavior to guarantee it can never be altered by a derived type.

---

## Concept Unit: Inheritance

### The Problem
When modeling concepts that share many attributes but differ slightly, you often end up copying and pasting properties and methods across multiple classes. This duplication means that fixing a bug in shared logic requires updating every single copy. You need a way to define common logic once and share it automatically.

### The New Code
```csharp
using System;

Animal myAnimal = new Animal();
myAnimal.Eat();

Dog myDog = new Dog();
myDog.Eat();

class Animal
{
    public void Eat()
    {
        Console.WriteLine("Consuming food.");
    }
}

class Dog : Animal 
{ 
}
```

### Mechanical Walkthrough
- `class Animal` defines a base class with a public method `Eat()`. This encapsulates logic that any animal should possess.
- `class Dog : Animal` defines a new class named `Dog` that inherits from `Animal`. The `:` symbol denotes this inheritance relationship. Because of this, `Dog` automatically possesses the `Eat()` method even though it is empty.
- `myDog.Eat();` executes the inherited method. Even though `Eat()` is not explicitly written inside the `Dog` class block, the compiler finds it on the base `Animal` class.

### CS Lens
This is subtyping. It establishes an "is-a" relationship (`Dog` is an `Animal`). In systems architecture, hierarchical classifications allow broad rules to be applied to categories of entities rather than individuals, much like how file systems treat both files and directories as "nodes" with a common set of metadata (creation date, owner).

### SE Lens
Inheritance provides code reuse. The alternative is composition, where a `Dog` would contain an `Animal` instance and manually forward calls to it. While composition is often safer for complex systems (avoiding deep, rigid hierarchies), inheritance is the most direct way to establish a shared structural baseline when the "is-a" relationship is mathematically strict.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n InheritanceApp`.
2. Open `InheritanceApp/Program.cs` and replace all contents with the code above.
3. Run `dotnet run`.
4. Observe the exact output:
   ```
   Consuming food.
   Consuming food.
   ```

---

## Concept Unit: virtual and override

### The Problem
Inheritance provides shared logic, but not all derived types should behave exactly like the base type. A dog doesn't make the same generic noise as a generic animal. You need a safe way to allow a base class to define a behavior, while giving derived classes permission to replace that behavior with their own specific version.

### The New Code
```csharp
using System;

Animal generic = new Animal();
Console.WriteLine(generic.Sound());

Dog fido = new Dog();
Console.WriteLine(fido.Sound());

class Animal
{
    public virtual string Sound()
    {
        return "Generic animal noise";
    }
}

class Dog : Animal
{
    public override string Sound()
    {
        return "Bark";
    }
}
```

### Mechanical Walkthrough
- `public virtual string Sound()` on `Animal` marks the method as overridable. The `virtual` keyword explicitly grants permission to derived classes to replace this implementation. Without it, standard methods cannot be overridden.
- `public override string Sound()` on `Dog` replaces the base implementation. The `override` keyword tells the compiler to swap out the `Animal` version of `Sound()` for this specific `Dog` version whenever a `Dog` instance is queried.
- `fido.Sound()` invokes the `Dog` class's overridden method, returning "Bark". The runtime knows `fido` is a `Dog` and uses its specialized method.

### CS Lens
This represents dynamic dispatch at a conceptual level (specifically, single dispatch based on the object's runtime type). The program maintains a lookup table (vtable) behind the scenes mapping the method call to the correct implementation based on exactly what the object was instantiated as.

### SE Lens
The Open/Closed Principle. The `Animal` class is closed for modification (you don't edit its code to add new animal sounds) but open for extension (you can create a `Cat` class that overrides `Sound()`). The alternative is a massive `switch` statement inside `Animal` checking types, which creates a maintenance nightmare every time a new animal type is introduced.

### Run It Yourself
1. Replace the contents of `Program.cs` with the code above.
2. Run `dotnet run`.
3. Observe the exact output:
   ```
   Generic animal noise
   Bark
   ```

---

## Concept Unit: Polymorphism

### The Problem
If you have a collection of different specific types that share a base class, managing them separately requires redundant loops or disjointed logic. You need a way to group them together and issue a uniform command to all of them, trusting each object to execute its own specific version of the command.

### The New Code
```csharp
using System;

Animal[] pets = new Animal[]
{
    new Dog(),
    new Cat(),
    new Animal()
};

foreach (Animal pet in pets)
{
    Console.WriteLine(pet.Sound());
}

class Animal
{
    public virtual string Sound() => "Generic animal noise";
}

class Dog : Animal
{
    public override string Sound() => "Bark";
}

class Cat : Animal
{
    public override string Sound() => "Meow";
}
```

### Mechanical Walkthrough
- `Animal[] pets` creates an array whose declared type is the base class `Animal`.
- `new Dog()` and `new Cat()` are assigned into the `Animal[]` array. This works because a `Dog` "is-a" `Animal`. Implicit upcasting happens here.
- `foreach (Animal pet in pets)` iterates through the array. The loop variable `pet` is statically typed as an `Animal`.
- `pet.Sound()` is called. At compile time, the compiler only guarantees `Animal` has a `Sound()` method. At runtime, the Common Language Runtime (CLR) inspects the actual type of the object stored in memory (whether it's a `Dog`, `Cat`, or just `Animal`) and routes the call to the most specific overridden version.

### CS Lens
Polymorphism literally means "many forms". It allows a single interface (the `Animal` reference) to represent different underlying forms (`Dog`, `Cat`). This maps directly to hardware device drivers: an operating system tells a generic "NetworkCard" interface to "SendPacket", and the specific Realtek or Intel driver executes its unique hardware instructions.

### SE Lens
This decouples the caller from the implementer. The loop calling `Sound()` does not know or care that `Cat` and `Dog` exist. You can add a `Bird` class tomorrow, put it in the array, and the loop code does not need to be recompiled or modified.

### Run It Yourself
1. Replace the contents of `Program.cs` with the code above.
2. Run `dotnet run`.
3. Observe the exact output:
   ```
   Bark
   Meow
   Generic animal noise
   ```

---

## Concept Unit: The base keyword

### The Problem
Sometimes an override shouldn't completely discard the base class's logic. If the base class performs necessary foundational setup or validation, completely overwriting it means you lose that work. You need a way to augment the base behavior rather than wholesale replacing it.

### The New Code
```csharp
using System;

AmplifiedDog loudFido = new AmplifiedDog();
Console.WriteLine(loudFido.Sound());

class Animal
{
    public virtual string Sound() => "Generic animal noise";
}

class Dog : Animal
{
    public override string Sound() => "Bark";
}

class AmplifiedDog : Dog
{
    public override string Sound()
    {
        return base.Sound() + " (LOUDER)";
    }
}
```

### Mechanical Walkthrough
- `class AmplifiedDog : Dog` inherits from `Dog`. Inheritance chains can be multiple levels deep.
- `public override string Sound()` overrides the method inherited from `Dog`.
- `base.Sound()` invokes the specific implementation of `Sound()` found on the immediate parent class (`Dog` in this case).
- `+ " (LOUDER)"` appends new data to the string returned by the parent. The derived class leverages the parent's work and extends it, rather than repeating the string "Bark".

### CS Lens
This is structural delegation. The derived type intercepts the request, delegates part of the work up the inheritance chain, and then modifies or appends to the result. It is similar to middleware in a web server, where a request is passed to the next handler and the response is modified on the way back out.

### SE Lens
Calling `base` prevents code duplication and enforces invariants. The alternative is copying the base class implementation into the derived class, which breaks if the base class logic ever needs to change. The cost is tight coupling; the derived class is highly dependent on exactly what the parent returns.

### Run It Yourself
1. Replace the contents of `Program.cs` with the code above.
2. Run `dotnet run`.
3. Observe the exact output:
   ```
   Bark (LOUDER)
   ```

---

## Concept Unit: sealed classes

### The Problem
If you write a class with precise, security-critical, or heavily optimized logic, allowing another programmer to inherit from it and override its methods introduces a risk of breaking your guarantees. You need a way to definitively state that a class is the end of the line and cannot be extended.

### The New Code
```csharp
using System;

SecureVault myVault = new SecureVault();
myVault.Unlock();

sealed class SecureVault
{
    public void Unlock()
    {
        Console.WriteLine("Unlocking with standard protocol.");
    }
}

// Uncommenting the below causes a compiler error
/*
class HackedVault : SecureVault
{
}
*/
```

### Mechanical Walkthrough
- `sealed class SecureVault` uses the `sealed` keyword on the class definition. This instructs the compiler to reject any attempt to use this class as a base class.
- The commented-out code `class HackedVault : SecureVault` would produce a compile-time error: `cannot derive from sealed type 'SecureVault'`. Because the class is sealed, it is mathematically impossible in C# to create a subclass of it.

### CS Lens
This restricts the type graph. By preventing derivation, the compiler can guarantee that a variable of type `SecureVault` points to exactly a `SecureVault` and not a malicious subclass. This allows the JIT (Just-In-Time) compiler to heavily optimize method calls, as it knows virtual dispatch will never be necessary for this type.

### SE Lens
Sealing a class communicates finality. The alternative is leaving everything unsealed by default (which C# does), requiring you to carefully document what is safe to override. Sealing prevents unintended misuse of your code. In .NET, core classes like `string` are sealed for performance and security reasons.

### Run It Yourself
1. Replace the contents of `Program.cs` with the code above.
2. Run `dotnet run` to confirm it prints `Unlocking with standard protocol.`
3. Uncomment the `HackedVault` class.
4. Run `dotnet build`.
5. Observe the exact compiler error: `error CS0509: 'HackedVault': cannot derive from sealed type 'SecureVault'`.

---

## Connect the Pieces
Consider a graphical user interface system. A base `UIElement` class defines a `virtual void Render()` method. It calculates screen boundaries and establishes an expected drawing context. A derived `Button` class inherits `UIElement` and overrides `Render()`. Inside `Button`'s override, it calls `base.Render()` to handle the complex boundary math, then adds its own logic to draw a rectangle and text. An array of `UIElement[]` holds buttons, text boxes, and sliders. A rendering loop iterates over this array, calling `Render()` on each. Polymorphism ensures the `Button` draws a button and the `TextBox` draws a text box, all initiated from a single, simple loop. Finally, a `PasswordBox` inherits `TextBox` but marks itself `sealed` to ensure no malicious code can subclass it to intercept keystrokes.

## What Breaks Without This
Without `virtual` and `override`, you attempt to hide methods rather than replace them, breaking polymorphism.

Create `Program.cs`:
```csharp
using System;

Animal myPet = new Dog();
Console.WriteLine(myPet.Sound()); // We expect "Bark"

class Animal
{
    public string Sound() => "Generic";
}

class Dog : Animal
{
    public string Sound() => "Bark"; // Warning CS0108
}
```
Run `dotnet run`. The output is `Generic`. Even though the object is a `Dog`, because `Animal.Sound()` was not `virtual` and `Dog.Sound()` did not use `override`, the `Animal` reference statically binds to the `Animal` implementation. To fix this, add `virtual` to the base method and `override` to the derived method, forcing the runtime to resolve the method dynamically.

## Exercises
1. **The Shape Hierarchy**: Create a base class `Shape` with a `virtual double Area()` that returns `0`. Create a `Square` subclass that overrides `Area()` to return `Side * Side`, and a `Circle` subclass returning `3.14 * Radius * Radius`. Create an array of `Shape`, add one of each, and loop to print their areas.
2. **Mandatory Base Call**: Create a `FileLogger` class with a `virtual` method `Log(string message)` that prepends the current timestamp to the message and prints it. Create a `ColoredConsoleLogger` that inherits `FileLogger`, overrides `Log`, changes the console text color to red, calls `base.Log()`, and resets the color. 
3. **The Unsealable Problem**: Attempt to inherit from the built-in `string` class (`class MyString : string { }`). Observe the compiler error proving that Microsoft sealed it.

## Definition of Done
- [ ] You have run every code example and verified the outputs.
- [ ] You have seen the compiler error when inheriting from a sealed class.
- [ ] You understand the difference between compile-time type (the variable declaration) and run-time type (the instantiated object).
- [ ] You can explain why `virtual` and `override` are required to make polymorphism work.
- [ ] You can explain Inheritance and Polymorphism out loud, in your own words, to someone who hasn't read this lesson.
