---
concept: 206-properties
name: Properties (C#)
---

## Definition

A property is a class member that looks like a public field from the
outside (accessed with `obj.Name`, no parentheses) but is actually backed
by get/set ACCESSOR methods, letting a class control or validate access
to its data without changing how callers use it syntactically.

## Problem

Using plain public fields directly exposes internal data with no way to
add validation or computed logic later without BREAKING every caller's
syntax (switching from field access to method calls everywhere).
Properties provide field-like SYNTAX with method-like CONTROL underneath
— a class can start with a simple auto-property and later add validation
logic to the setter without changing how any caller accesses it.

## Execution

An auto-property declares a public field-like member — the compiler
generates a hidden backing field automatically
↓
Assigning to it LOOKS like direct field access, but actually calls the
generated `set` accessor
↓
A property can instead have EXPLICIT validation logic in its setter,
rejecting invalid values
↓
Assigning an invalid value throws an exception, since the setter's
validation rejects it — this happens with the EXACT SAME assignment
syntax callers already use, no API change needed
↓
A property can also be READ-ONLY (`get` only, no `set`), computed on the
fly from OTHER fields rather than stored directly at all

## Computer Science

Properties are syntactic sugar over accessor METHODS — under the hood,
assigning to a property compiles to a call like `set_Name(...)`,
indistinguishable in IL bytecode from an ordinary method call, but
presented to source code as if it were direct field access.

Tags: Syntactic sugar, Accessor methods, Encapsulation without API change

## Software Engineering

Starting a class with auto-properties and only adding explicit
validation logic LATER, if and when it's actually needed, is the
idiomatic C# approach — since the property syntax stays IDENTICAL for
callers whether it's a trivial auto-property or has complex validation,
there's no cost to starting simple.

Tags: Encapsulation evolution, Auto-properties, API stability

## Common Mistakes

- Using plain public FIELDS instead of properties for anything that might EVER need validation or computed logic later — switching a public field to a property later is technically a breaking change in some contexts (like reflection-based serialization), while starting with an auto-property avoids that risk entirely.
- Putting expensive computation inside a property getter without realizing callers expect property access to be CHEAP (like a field read) — a property that does significant work should usually be a regular METHOD instead, to signal that cost to callers.

## Exercises

- Trace through what happens when an invalid value is assigned to the validating `Age` property in the example below — where exactly does the exception get thrown, and does it prevent the backing field from ever being set to the invalid value?
- Explain why switching a class's public field to an auto-property later doesn't require ANY changes to code that already accesses it.

## csharp

```csharp
using System;

var p = new Person();
p.Name = "Alice";
p.Age = 30;
Console.WriteLine($"{p.Name} is {p.Age}");

try
{
    p.Age = -5;
}
catch (ArgumentException e)
{
    Console.WriteLine($"caught: {e.Message}");
}
Console.WriteLine($"Age is still: {p.Age}");

public class Person
{
    private int _age;

    public string Name { get; set; } = "";

    public int Age
    {
        get => _age;
        set
        {
            if (value < 0) throw new ArgumentException("age can't be negative");
            _age = value;
        }
    }
}
```
Walkthrough: `p.Name = "Alice"` uses `Name`'s auto-generated setter,
requiring zero validation code. `p.Age = -5` triggers `Age`'s custom
setter, which throws BEFORE `_age` is ever actually assigned — so `p.Age`
still reports `30` afterward, confirming the invalid value never took
effect, all while callers use the exact same `p.Age = value` syntax
regardless of which property has validation logic behind it.
