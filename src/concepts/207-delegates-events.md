---
concept: 207-delegates-events
name: Delegates and Events (C#)
---

## Definition

A delegate is a type-safe reference to a method (or several methods) that
can be invoked like a function — the foundation for C#'s EVENTS, which
let a class notify subscribers when something happens, without the
publishing class needing to know who's listening.

## Problem

A class that needs to notify OTHER, unrelated code when something
happens (a button was clicked, a value changed) can't hard-code calls to
every possible listener, since it doesn't know who they'll be in
advance. Delegates let a class hold a reference to "whatever method(s)
should run," and events build on top of delegates to provide a safe,
standard publish/subscribe pattern where multiple independent subscribers
can register and be notified.

## Execution

A delegate TYPE describes a method signature: takes a `string`, returns
`void`
↓
A class exposes an EVENT of that delegate type — external code can
SUBSCRIBE to it, but can't directly INVOKE it from outside (only the
declaring class can raise it)
↓
MULTIPLE independent subscribers register, using `+=`
↓
Inside the class, raising the event calls ALL registered subscribers,
one after another — the class doesn't know or care how many subscribers
exist, or what they do
↓
Unsubscribing removes a specific handler with `-=`, without affecting
other still-subscribed handlers

## Computer Science

A delegate is a type-safe function pointer that can hold MULTIPLE method
references simultaneously (a "multicast delegate") — invoking it calls
every registered method in the order they were added, which is exactly
what makes events support multiple independent subscribers without the
publishing class needing to manage a list itself.

Tags: Multicast delegates, Function pointers (type-safe), Publish-subscribe

## Software Engineering

Wrapping a delegate as an `event` (rather than exposing a plain public
delegate field) restricts external code to ONLY subscribing/unsubscribing
(`+=`/`-=`), preventing outside code from directly INVOKING the delegate
or overwriting the entire subscriber list with `=` — this protects the
publish/subscribe contract from being broken by careless external code.

Tags: Event encapsulation, Preventing external invocation, API safety

## Common Mistakes

- Forgetting the `?.` null-conditional check before invoking an event — if NO subscribers have registered yet, the event delegate is `null`, and invoking it directly throws a `NullReferenceException`.
- Exposing a plain delegate field instead of a proper `event` — this lets any external code invoke it directly or overwrite ALL existing subscribers with `=`, breaking the safe publish/subscribe contract events are meant to enforce.

## Exercises

- Trace through what happens if an event has ZERO subscribers when the class tries to raise it — what does the null-conditional invoke do in that case, versus what a direct (non-null-conditional) invoke would do?
- Explain why declaring a member as an `event` instead of a plain public delegate field prevents external code from directly invoking it.

## csharp

```csharp
using System;

var alarm = new Alarm();

Notify handler1 = (msg) => Console.WriteLine($"Handler 1: {msg}");
Notify handler2 = (msg) => Console.WriteLine($"Handler 2: {msg}");

alarm.OnAlert += handler1;
alarm.OnAlert += handler2;

alarm.Trigger("Fire!");   // BOTH handlers run

alarm.OnAlert -= handler1;   // unsubscribe just handler1

alarm.Trigger("Smoke detected!");   // only handler2 runs now

public delegate void Notify(string message);

public class Alarm
{
    public event Notify? OnAlert;

    public void Trigger(string message)
    {
        OnAlert?.Invoke(message);   // null-conditional -- safe even if nobody has subscribed yet
    }
}
```
Walkthrough: after both handlers subscribe, `Trigger("Fire!")` invokes
BOTH of them, printing two lines. After `handler1` unsubscribes via
`-=`, the SAME `Trigger` call for "Smoke detected!" only invokes
`handler2`, demonstrating that events maintain an independent,
modifiable list of subscribers, and the publishing class never needs to
know how many there are or what they do.
