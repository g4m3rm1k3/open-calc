---
series: csharp-fundamentals
level: 20
title: Events
lang: csharp
---

# Events

`Func`/`Action`/`Predicate` (Level 14) hold methods as values — real, but a plain `Action` field on a class has a real problem: any outside code can wipe out every subscriber with a single `=`, or invoke it directly without permission. An **event** is a `Action`-shaped (or any delegate-shaped) member with real, enforced rules about who can do what to it — the standard C# mechanism for "notify anyone who's listening, when something happens."

## Declaring and Raising an Event

```csharp
using System;

class Button
{
    public event Action Clicked;

    public void Click()
    {
        if (Clicked != null) Clicked();
    }
}

class Program
{
    static void Main()
    {
        var button = new Button();
        button.Clicked += () => Console.WriteLine("Handler 1 ran");
        button.Clicked += () => Console.WriteLine("Handler 2 ran");

        button.Click();
    }
}
```

```text
Handler 1 ran
Handler 2 ran
```

`public event Action Clicked;` — `event` marks `Clicked` as an event: outside code (like `Program`) can subscribe with `+=` and unsubscribe with `-=`, but can never directly call `button.Clicked()` or overwrite it with `=` — only `Button` itself, from inside its own methods, can actually raise it.

`button.Clicked += () => ...` — subscribes a lambda (Level 14) as a handler. A second `+=` adds a second, independent handler — `Clicked` is multicast (Level 14's own delegate variables already were), so raising it once runs every subscribed handler, in the order they were added.

`if (Clicked != null) Clicked();` — raises the event, but only if at least one handler is actually subscribed; an event with zero subscribers is `null`, and calling `null()` would throw.

## Events That Carry Data

```csharp
using System;

class Publisher
{
    public event Action<string> MessageReceived;

    public void Publish(string msg)
    {
        MessageReceived?.Invoke(msg);
    }
}

class Program
{
    static void Main()
    {
        var pub = new Publisher();
        pub.MessageReceived += msg => Console.WriteLine("Got: " + msg);
        pub.Publish("hello");

        var pub2 = new Publisher();
        pub2.Publish("nothing subscribed");
        Console.WriteLine("no crash");
    }
}
```

```text
Got: hello
no crash
```

`public event Action<string> MessageReceived;` — an event can be any delegate type, not just plain `Action` — `Action<string>` carries one `string` argument to every handler.

`MessageReceived?.Invoke(msg);` — the null-conditional operator (Level 13) applied to raising an event: `?.Invoke(msg)` only calls `Invoke` if `MessageReceived` isn't `null`, replacing the explicit `if (... != null)` check the first example wrote by hand. `pub2.Publish(...)`, with zero subscribers, safely does nothing at all instead of throwing.

**CS lens:** This is the real mechanism behind almost every UI framework's "something happened" notification — a button's `Clicked`, a text box's `TextChanged` — all built on exactly this `event`/`+=`/`?.Invoke` pattern, whether the framework is written in C#, Java, or JavaScript's own listener model.

## A Real Notification Use Case

```csharp
using System;

class Counter
{
    private int _count;
    public event Action<int> CountChanged;

    public void Increment()
    {
        _count++;
        CountChanged?.Invoke(_count);
    }
}

class Program
{
    static void Main()
    {
        var counter = new Counter();
        counter.CountChanged += n => Console.WriteLine("Count is now " + n);

        counter.Increment();
        counter.Increment();
        counter.Increment();
    }
}
```

```text
Count is now 1
Count is now 2
Count is now 3
```

`Counter` never needs to know *what* code cares about its count changing, or how many separate places care — it only needs to raise `CountChanged` every time `_count` actually changes, and let whoever subscribed react.

**SE lens:** This is the **Observer pattern**, named directly: a subject (`Counter`) that notifies any number of independent observers without knowing anything about them in advance, versus the subject having to call a specific, hard-coded method on a specific, hard-coded object every time something happens. Adding a second, third, or tenth observer later never requires changing `Counter` itself — only adding another `+=` at the call site.

## Challenge: temperature_alert

Write a `TemperatureSensor` class with:
- A `public event Action<double> ThresholdExceeded;` event
- A method `void ReportTemperature(double temp)` that raises `ThresholdExceeded` with `temp` as the argument, but only when `temp > 100.0`

```challenge
class TemperatureSensor
{
    // TODO
}
```

```test
var sensor = new TemperatureSensor();
var alerts = new List<double>();
sensor.ThresholdExceeded += t => alerts.Add(t);
sensor.ReportTemperature(50.0);
assert alerts.Count == 0
sensor.ReportTemperature(150.0);
assert alerts.Count == 1
assert alerts[0] == 150.0
sensor.ReportTemperature(100.0);
assert alerts.Count == 1
sensor.ReportTemperature(200.0);
assert alerts.Count == 2
```
