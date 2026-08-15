# Lesson 03: Discovering an API at Runtime

**What this covers:** `System.Reflection` — C#'s real, direct
equivalent of Python's `dir()`/`help()` — printing out everything a
real, unfamiliar object actually has, live, so you can see it and try
it, exactly the workflow you already use in Python.

**What you need first:** [Lesson 02](lesson-02-reading-an-unfamiliar-types-shape.md).

---

## `GetType()` — the real starting point

In Python: `type(obj)`, or `obj.__class__`. In C#:

```csharp
Type type = part.GetType();
Console.WriteLine(type.FullName);
```

`GetType()` returns the real, actual, runtime type behind `part` —
even if `part`'s own, *declared* type is an interface (`IMachinable`,
Lesson 01), `GetType()` tells you the real, concrete class underneath
it. `.FullName` gives you the real, fully-qualified name, namespace
included.

## Listing every real method — the direct equivalent of `dir()`

```csharp
using System.Reflection;

foreach (MethodInfo method in type.GetMethods())
{
    Console.WriteLine(method.Name);
}
```

`GetMethods()` returns a real, live list of every real, public method
this type has — `MethodInfo`, one real object per method, each one
holding real, structured detail about it (not just a name). One
honest, real surprise the first time you run this: you'll see
`ToString`, `Equals`, `GetHashCode`, and `GetType` in the real output
too — every C# object real inherits these from `System.Object`, the
identical real reason Python's own `dir()` always shows `__class__`,
`__eq__`, and friends even on an object you just made up.

## Listing every real property, with its real type

```csharp
foreach (PropertyInfo prop in type.GetProperties())
{
    Console.WriteLine($"{prop.PropertyType.Name} {prop.Name}");
}
```

```
String Name
Double Volume
```

`GetProperties()` gives you `PropertyInfo` objects — `.PropertyType`
tells you the real, declared type of each one, `.Name` the real
property name. This alone often tells you most of what you need
before ever opening real documentation.

## Reading a real method's full, real signature

```csharp
foreach (MethodInfo method in type.GetMethods())
{
    var parameters = string.Join(", ", method.GetParameters().Select(p => $"{p.ParameterType.Name} {p.Name}"));
    Console.WriteLine($"{method.ReturnType.Name} {method.Name}({parameters})");
}
```

```
Void Cut(Double depth)
Double ComputeVolume(Boolean includeHoles)
```

`method.GetParameters()` returns real, ordered `ParameterInfo`
objects, one per real, declared parameter — combined with
`.ReturnType`, this reconstructs the real, complete signature Lesson
02 taught you to read, generated directly from the real, live type
itself, not typed documentation that could be stale.

## Definition of done

- [ ] You called `GetType()` on a real object and printed its real,
      full name.
- [ ] You listed every real method on a real, unfamiliar type and
      correctly identified which ones came from `System.Object`.
- [ ] You listed every real property, with its real declared type.
- [ ] You reconstructed one real method's full, real signature using
      `GetParameters()`.

## Next

[Lesson 04 — Discovering an API in Visual Studio](lesson-04-discovering-an-api-in-visual-studio.md)
covers the way this actually gets done day to day — reflection is real
and powerful, but IntelliSense is faster for the real, everyday case.
