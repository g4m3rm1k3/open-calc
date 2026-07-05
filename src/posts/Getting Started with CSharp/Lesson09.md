# Events: Reacting to Things That Happen

A button click, a timer going off, a download finishing, a new message arriving — these are all **events**: things that happen at unpredictable times, to which your code needs to react. C#'s **event** system is the built-in way to handle this. It lets one part of your code say "tell me when this happens" and another part say "it just happened!"

## The Problem Events Solve

Imagine a class that downloads data. It finishes at some unknown time in the future. How does it tell the rest of your program? You could check repeatedly ("is it done yet?"), but that's wasteful. Events let it instead **notify** any interested code the instant it completes.

This pattern — "notify me when something happens" — is called **publish/subscribe** or **observer**. The class that has the event is the **publisher**. Code that wants to know about it is a **subscriber**.

## Delegates: The Foundation

Before events, you need to understand **delegates** (covered in Lesson 05, revisited here for events). A delegate is a variable that holds a method — or several methods at once. Events are built on top of delegates.

```csharp
// A delegate type: defines the signature of methods that can be stored
// This one takes a string and returns nothing
delegate void MessageHandler(string message);

static void DisplayMessage(string msg)
{
    Console.WriteLine($"Display: {msg}");
}

static void LogMessage(string msg)
{
    Console.WriteLine($"Log: {msg}");
}

// A delegate variable can hold one method
MessageHandler handler = DisplayMessage;
handler("Hello");   // Display: Hello

// Or multiple methods — using += to add more
handler += LogMessage;
handler("Hello");   // Runs BOTH methods:
                    // Display: Hello
                    // Log: Hello

// Use -= to remove a method
handler -= DisplayMessage;
handler("Hello");   // Only LogMessage now:
                    // Log: Hello
```

The `+=` operator adds a method to the delegate's **invocation list** — all the methods it will call. `-=` removes one.

## Declaring and Using an Event

An `event` is a delegate variable with restrictions: outside code can only `+=` (subscribe) or `-=` (unsubscribe) — it cannot call the event directly or replace it. Only the class that owns the event can **raise** (invoke) it.

Here's a complete example of a timer that raises an event every tick:

```csharp
class SimpleTimer
{
    // Step 1: Declare the event using a delegate type.
    // 'event' keyword means: subscribers can += and -= but cannot invoke directly.
    // Action<int> is a built-in delegate type: a method that takes an int, returns void.
    public event Action<int>? Tick;

    // This method raises (fires) the event
    public void Start(int ticks, int intervalMs)
    {
        for (int i = 1; i <= ticks; i++)
        {
            // Wait before firing
            System.Threading.Thread.Sleep(intervalMs);

            // Raise the event: notify all subscribers.
            // The ?. (null conditional) is needed because Tick is null if nobody subscribed.
            // Without it, invoking a null event would crash.
            Tick?.Invoke(i);
        }
    }
}

class Program
{
    static void Main()
    {
        var timer = new SimpleTimer();

        // Subscribe: "when Tick fires, run this lambda"
        timer.Tick += tickNumber =>
        {
            Console.WriteLine($"Tick #{tickNumber}");
        };

        // Subscribe a second handler to the same event
        timer.Tick += tickNumber =>
        {
            if (tickNumber % 2 == 0)
                Console.WriteLine($"  (even tick!)");
        };

        // Start the timer — it fires Tick 5 times, 500ms apart
        timer.Start(5, 500);
    }
}
```

Output:
```
Tick #1
Tick #2
  (even tick!)
Tick #3
Tick #4
  (even tick!)
Tick #5
```

Both subscribers run each time the event fires. The timer class doesn't know or care how many subscribers there are or what they do — it just fires the event.

## `EventHandler<TEventArgs>`: The Standard Pattern

The pattern above works, but .NET has a **standard convention** for events, used throughout the entire framework: events should use `EventHandler<TEventArgs>`. Following this convention means your events look consistent with every other .NET event.

The convention:
- The event delegate takes two parameters: `object sender` (who fired it) and a `TEventArgs` (the event data)
- Create a class that inherits from `EventArgs` to hold the event's specific data

```csharp
// Step 1: Create an EventArgs class to hold the event's data
class TemperatureChangedEventArgs : EventArgs
{
    // EventArgs is a simple base class with no built-in data —
    // we add whatever fields are relevant to our event
    public double OldTemperature { get; }
    public double NewTemperature { get; }
    public DateTime TimeOfChange { get; }

    public TemperatureChangedEventArgs(double oldTemp, double newTemp)
    {
        OldTemperature = oldTemp;
        NewTemperature = newTemp;
        TimeOfChange   = DateTime.Now;
    }
}

// Step 2: The publisher class
class Thermostat
{
    private double _temperature;

    // Declare the event using the standard EventHandler<T> delegate type
    // 'object? sender' will be 'this' — a reference to the Thermostat that fired
    // 'TemperatureChangedEventArgs e' holds the event data
    public event EventHandler<TemperatureChangedEventArgs>? TemperatureChanged;

    public double Temperature
    {
        get => _temperature;
        set
        {
            if (value == _temperature) return;   // No change — don't fire event

            double old = _temperature;
            _temperature = value;

            // Raise the event — notify all subscribers
            // Pass 'this' as sender so subscribers know which thermostat fired
            TemperatureChanged?.Invoke(this, new TemperatureChangedEventArgs(old, value));
        }
    }
}

// Step 3: The subscriber — code that reacts to the event
class HeatingSystem
{
    // This method has the right signature to subscribe to TemperatureChanged
    // object sender = the Thermostat that fired
    // TemperatureChangedEventArgs e = the temperature data
    public void OnTemperatureChanged(object? sender, TemperatureChangedEventArgs e)
    {
        Console.WriteLine($"Temperature changed: {e.OldTemperature}°C → {e.NewTemperature}°C");

        if (e.NewTemperature < 18)
            Console.WriteLine("  ► Heating turned ON");
        else if (e.NewTemperature > 24)
            Console.WriteLine("  ► Cooling turned ON");
        else
            Console.WriteLine("  ► Temperature comfortable, nothing to do");
    }
}

// Putting it all together
var thermostat    = new Thermostat();
var heatingSystem = new HeatingSystem();

// Subscribe: when thermostat fires TemperatureChanged, call heatingSystem.OnTemperatureChanged
thermostat.TemperatureChanged += heatingSystem.OnTemperatureChanged;

// Also subscribe a lambda for logging
thermostat.TemperatureChanged += (sender, e) =>
{
    Console.WriteLine($"  [LOG] Recorded at {e.TimeOfChange:HH:mm:ss}");
};

// Now change the temperature — this fires the event both times
thermostat.Temperature = 15;
Console.WriteLine();
thermostat.Temperature = 22;
Console.WriteLine();
thermostat.Temperature = 28;
```

## Unsubscribing: Avoiding Memory Leaks

When you subscribe to an event with `+=`, the publisher holds a reference to your subscriber. If you forget to unsubscribe with `-=`, the subscriber object can't be garbage collected — this is an **event memory leak**, one of the most common bugs in C# applications.

```csharp
class DataLoader
{
    public event EventHandler<string>? DataLoaded;

    public void Load()
    {
        // Simulate loading
        DataLoaded?.Invoke(this, "{ data: 42 }");
    }
}

class Dashboard
{
    private readonly DataLoader _loader;

    public Dashboard(DataLoader loader)
    {
        _loader = loader;

        // Subscribe
        _loader.DataLoaded += OnDataLoaded;
    }

    private void OnDataLoaded(object? sender, string data)
    {
        Console.WriteLine($"Dashboard received: {data}");
    }

    // Call this when the Dashboard is closed / no longer needed
    public void Dispose()
    {
        // Unsubscribe! Without this, _loader holds a reference to 'this'
        // and prevents it from being garbage collected.
        _loader.DataLoaded -= OnDataLoaded;
        Console.WriteLine("Dashboard unsubscribed.");
    }
}

var loader    = new DataLoader();
var dashboard = new Dashboard(loader);

loader.Load();       // Dashboard received: { data: 42 }

dashboard.Dispose(); // Unsubscribe

loader.Load();       // Dashboard no longer notified — handler was removed
```

## Events in Practice: A Simple Button

Here's a pattern you'll see in UI frameworks (WinForms, WPF, MAUI, etc.):

```csharp
class Button
{
    // The Click event — any code can subscribe to it
    public event EventHandler? Click;

    // Called by the framework when the user physically clicks the button
    protected virtual void OnClick()
    {
        // The 'protected virtual' convention lets subclasses override how the event fires
        // EventArgs.Empty is used when there's no event data to pass
        Click?.Invoke(this, EventArgs.Empty);
    }

    // Simulate a user click for demonstration
    public void SimulateClick() => OnClick();
}

var saveButton = new Button();

// Subscribe to the Click event
saveButton.Click += (sender, e) =>
{
    Console.WriteLine("Save button clicked — saving data...");
};

saveButton.Click += (sender, e) =>
{
    Console.WriteLine("Save button clicked — updating status bar...");
};

saveButton.SimulateClick();
// Save button clicked — saving data...
// Save button clicked — updating status bar...
```

This is almost exactly how real WinForms code looks. The framework calls `OnClick` when the user clicks; your code subscribes to `Click` and decides what to do.

## Summary: Key Rules for Events

1. **Declare with `event`** — prevents outside code from invoking or replacing the event
2. **Use `?.Invoke`** when raising — prevents a crash if nobody has subscribed
3. **Use `EventHandler<TEventArgs>`** — the standard .NET pattern for real-world code
4. **Create an `EventArgs` subclass** to carry event data
5. **Unsubscribe with `-=`** when the subscriber is no longer needed — prevents memory leaks
6. **Name events in past tense** for things that happened (`DataLoaded`, `ButtonClicked`) or present tense for things about to happen (`Closing`, `Changing`)
