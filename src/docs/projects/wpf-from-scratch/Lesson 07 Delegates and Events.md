# Lesson 07: Delegates and Events

**What you will build:** A console application that passes functions around like variables and reacts to occurrences happening in other objects. You will establish a secure broadcast system where one object can announce events and multiple other objects can react, forming the backbone of how graphical user interfaces handle button clicks and user interactions.

**What you need to know first:** Lesson 06 (or standard C# classes, methods, and properties).

**Terms introduced in this lesson:**
- **Delegate** — a variable that holds a reference to a method instead of a value. *Why it exists:* It allows you to treat behavior (code) as data, passing it into other methods or storing it for later execution.
- **Lambda expression** — an anonymous, inline method defined with the `=>` operator. *Why it exists:* It reduces boilerplate when you need to create a small function specifically to pass it to a delegate, preventing the need to write a full method elsewhere.
- **Event** — a restricted delegate wrapper that only allows outside code to subscribe or unsubscribe. *Why it exists:* It prevents outside code from accidentally wiping out other subscribers or maliciously triggering the notification itself.

**Objects and methods used:**
- **Action / Action<T>**
  - *What it is:* A built-in delegate type that points to a method returning `void`.
  - *Implementation:* `public delegate void Action();`
  - *Its use:* Used to store or pass a method that performs an action but returns no result.
- **Func<T, TResult>**
  - *What it is:* A built-in delegate type that points to a method taking parameters and returning a value.
  - *Implementation:* `public delegate TResult Func<in T, out TResult>(T arg);`
  - *Its use:* Used for calculations, filtering, or any function reference that produces a result.
- **EventHandler<TEventArgs>**
  - *What it is:* The standard .NET delegate for events.
  - *Implementation:* `public delegate void EventHandler<TEventArgs>(object? sender, TEventArgs e);`
  - *Its use:* Provides a uniform shape for all events in .NET, ensuring every event handler knows who triggered it and what data it carries.

---

## Concept Unit: Action and Action<T>

### The Problem
Variables normally hold data: a number, a string, or a reference to an object. But sometimes you want to hold a *behavior*. For example, you want to give a button a set of instructions to run when clicked. You need a variable that stores "which method to call."

### The New Code
```csharp
using System;

Action sayHello = Greet;
sayHello();

Action<string> saySomething = Echo;
saySomething("Hello, routing!");

void Greet()
{
    Console.WriteLine("Hello!");
}

void Echo(string message)
{
    Console.WriteLine(message);
}
```

### Mechanical Walkthrough
- `Action sayHello`: Declares a variable named `sayHello` whose type is `Action`. An `Action` can only hold a reference to a method that takes no parameters and returns `void`.
- `= Greet;`: Assigns the method `Greet` to the variable. Notice there are no parentheses after `Greet`. We are not *calling* the method; we are pointing to it.
- `sayHello();`: Calls the method currently stored in the variable.
- `Action<string>`: The `<string>` part is a generic type parameter. It specifies that this `Action` expects a method that takes exactly one `string` parameter.
- `saySomething("Hello, routing!");`: Invokes the stored method, passing the required string argument.

### CS Lens
This is the concept of "First-class functions." Treating functions as first-class citizens means they can be assigned to variables, passed as arguments, and returned from other functions, just like any other data type.

### SE Lens
This provides the foundation for the "Command pattern" and "Callbacks." Instead of hardcoding what an object does when a task finishes, you hand it a delegate. The tradeoff is traceability: when reading `sayHello()`, you cannot tell what will happen without finding where `sayHello` was assigned, making the execution flow dynamic but harder to follow statically.

### Run It Yourself
Create a new .NET 8 console project (`dotnet new console`). Replace `Program.cs` with the code above. Run it (`dotnet run`).
**Expected Output:**
```
Hello!
Hello, routing!
```

---

## Concept Unit: Func<T, TResult> and Lambda Expressions

### The Problem
`Action` is great for methods that just *do* something, but what if you need to store a method that calculates and *returns* a value? Furthermore, creating a full named method like `bool IsEven(int n)` just to pass it once is verbose.

### The New Code
```csharp
using System;

Func<int, bool> isEven = n => n % 2 == 0;

bool result = isEven(4);
Console.WriteLine($"Is 4 even? {result}");
```

### Mechanical Walkthrough
- `Func<int, bool>`: Declares a delegate variable. The last type parameter (`bool`) is always the return type. Any preceding parameters (`int`) are the inputs. This stores a method taking an `int` and returning a `bool`.
- `n =>`: The lambda operator `=>` is read as "goes to". The `n` on the left is the input parameter. Its type (`int`) is inferred by the compiler from the `Func<int, bool>` declaration.
- `n % 2 == 0`: The body of the lambda. For single-line lambdas, the evaluation of this expression is automatically returned. No `return` keyword or curly braces `{}` are needed.
- `isEven(4)`: Executes the lambda function with `4` as the argument `n`.

### CS Lens
This is an "Anonymous Function" or "Closure." It allows you to define behavior perfectly at the site where it is used, rather than polluting the class with small, single-use methods.

### SE Lens
Lambdas severely reduce boilerplate, making code more readable by keeping the logic exactly where it is passed. The cost is that anonymous functions cannot be easily reused elsewhere, and complex lambdas become unreadable, violating the principle of keeping functions small and named.

### Run It Yourself
Paste the code into `Program.cs` and run it.
**Expected Output:**
```
Is 4 even? True
```

---

## Concept Unit: The Event Keyword

### The Problem
If a class exposes a public `Action` variable, any external code can add a method to it using `+=`. However, external code can also mistakenly use `=` and wipe out all other methods, or invoke the action directly `action()`, faking an occurrence. You need a way to allow objects to subscribe, but protect the trigger mechanism.

### The New Code
```csharp
using System;

AlarmClock clock = new AlarmClock();

// Subscribe
clock.OnRing += WakeUp;
clock.OnRing += TurnOnLights;

// Trigger the alarm
clock.TriggerAlarm();

// Unsubscribe
clock.OnRing -= TurnOnLights;
clock.TriggerAlarm();

void WakeUp() => Console.WriteLine("Waking up!");
void TurnOnLights() => Console.WriteLine("Lights are on!");

class AlarmClock
{
    public event Action? OnRing;

    public void TriggerAlarm()
    {
        Console.WriteLine("Alarm triggered internally...");
        OnRing?.Invoke();
    }
}
```

### Mechanical Walkthrough
- `public event Action? OnRing;`: Declares an event. The `event` keyword applies a restriction to the `Action` delegate: code *outside* the `AlarmClock` class can only use `+=` and `-=`. It cannot use `=` or `OnRing()`. The `?` makes it nullable, meaning it might have zero subscribers.
- `clock.OnRing += WakeUp;`: Adds the `WakeUp` method to the event's invocation list. When the event fires, `WakeUp` will run.
- `clock.OnRing -= TurnOnLights;`: Removes the `TurnOnLights` method from the list. It will no longer run when the event fires.
- `OnRing?.Invoke();`: Safe invocation. The `?` checks if `OnRing` is `null` (has zero subscribers) before calling `Invoke()`. If it is null, it does nothing, preventing a crash.

### CS Lens
This implements the "Observer Pattern". A Subject (`AlarmClock`) maintains a list of dependents/Observers (`WakeUp`, `TurnOnLights`) and notifies them automatically of any state changes.

### SE Lens
The `event` keyword enforces "Encapsulation." The publisher owns the moment of broadcasting; subscribers only control whether they are listening. The tradeoff is memory leaks: if a subscriber lives longer than the publisher but forgets to `-=`, the publisher's event still holds a reference to the subscriber, preventing it from being garbage collected.

### Run It Yourself
Paste into `Program.cs` and run.
**Expected Output:**
```
Alarm triggered internally...
Waking up!
Lights are on!
Alarm triggered internally...
Waking up!
```

---

## Concept Unit: EventHandler<T> and EventArgs

### The Problem
If every class uses different delegate shapes (`Action`, `Action<string>`, `Func<int, string>`) for events, subscribing becomes inconsistent. Moreover, when a subscriber handles an event, it often needs to know *who* triggered it and *what* the specific details are.

### The New Code
```csharp
using System;

Server myServer = new Server();
myServer.MessageReceived += LogMessage;

myServer.Receive("User login");

void LogMessage(object? sender, MessageEventArgs e)
{
    Console.WriteLine($"[Logger] {e.Content} arrived at {e.Timestamp}");
}

class MessageEventArgs : EventArgs
{
    public string Content { get; }
    public DateTime Timestamp { get; }

    public MessageEventArgs(string content)
    {
        Content = content;
        Timestamp = DateTime.Now;
    }
}

class Server
{
    public event EventHandler<MessageEventArgs>? MessageReceived;

    public void Receive(string text)
    {
        MessageEventArgs args = new MessageEventArgs(text);
        MessageReceived?.Invoke(this, args);
    }
}
```

### Mechanical Walkthrough
- `MessageEventArgs : EventArgs`: Creates a custom class to hold event data. It inherits from `EventArgs`, which is the .NET base class for event data.
- `EventHandler<MessageEventArgs>`: A standard delegate built into .NET that strictly enforces a specific signature for the handling method: `void MethodName(object? sender, MessageEventArgs e)`.
- `void LogMessage(object? sender, MessageEventArgs e)`: The method matches the expected signature. `sender` is the object that fired the event (the `Server`), and `e` contains the data.
- `MessageReceived?.Invoke(this, args);`: The class fires the event. `this` is passed as the `sender` argument, identifying the current `Server` instance as the origin.

### CS Lens
This is a standard "Protocol" or "Convention." By enforcing a universal shape `(object sender, EventArgs e)`, any piece of .NET code can predict how to interact with events, regardless of the domain.

### SE Lens
This pattern is critical in UI frameworks like WPF. A button click in WPF is an event. The `sender` tells you *which* button was clicked, and `e` tells you details like whether the Shift key was held down. The tradeoff is slight verbosity: you must create an `EventArgs` class even for simple data.

### Run It Yourself
Paste into `Program.cs` and run.
**Expected Output:**
```
[Logger] User login arrived at [Current Date and Time]
```

---

## Connect the Pieces
A piece of data representing a click begins as a hardware interrupt. The operating system hands it to your application. A UI element (the `sender`) constructs an `EventArgs` object containing the mouse coordinates. It checks its `event` field. Because you used `+=` to attach a lambda or method (`Action` or `EventHandler`), the UI element calls `Invoke(this, args)`, passing the data directly into your custom code, successfully routing a physical click into your application logic.

## What Breaks Without This
Try to invoke an event from the outside. Modify the `AlarmClock` code from Unit 3, replacing `clock.TriggerAlarm();` with:
```csharp
clock.OnRing();
```
**The Failure:**
```
error CS0070: The event 'AlarmClock.OnRing' can only appear on the left hand side of += or -= (except when used from within the type 'AlarmClock')
```
Events fiercely protect their invocation. Without this protection, any random class could trigger your class's events, causing chaos in application state.

## Exercises
1. **The Math Operator:** Create a method that takes two `int` parameters and a `Func<int, int, int> operation`. Call it with different lambdas to perform addition, subtraction, and multiplication.
2. **The Thermostat:** Create a `Thermostat` class with an `event EventHandler<TemperatureChangedEventArgs> TemperatureChanged`. Fire the event when the temperature crosses 80 degrees. Subscribe to it from your `Program` and print a warning.

## Definition of Done
- [ ] You can explain the difference between declaring a method and storing a reference to a method in an `Action`.
- [ ] You can write a basic lambda expression using `=>`.
- [ ] You can explain why `event` is used instead of a raw `Action` or delegate.
- [ ] You understand the purpose of `object? sender` and `EventArgs` in the standard .NET event pattern.
- [ ] You can explain Delegates and Events out loud, in your own words, to someone who hasn't read this lesson.
