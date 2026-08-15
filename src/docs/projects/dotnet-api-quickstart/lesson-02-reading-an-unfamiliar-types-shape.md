# Lesson 02: Reading an Unfamiliar Type's Shape

**What this covers:** properties vs. methods, method signatures,
overloads, and just enough generics to read a real, unfamiliar API's
documentation without your eyes glazing over.

**What you need first:** [Lesson 01](lesson-01-interfaces-and-implementation.md).

---

## Properties: read like a field, work like a method

```csharp
public interface IPart
{
    string Name { get; }
    double Volume { get; set; }
}
```

`Name` and `Volume` look like real, plain fields when you use them —
`part.Name`, `part.Volume = 12.5` — but they're real **properties**:
under the hood, each one is really a method call. `{ get; }` alone
(no `set`) means real, read-only — you can look, but any real attempt
to assign to it won't compile. This is the single most common real
shape you'll see in a documented API: data exposed as properties, not
as raw, public fields.

## Method signatures: what goes in, what comes out

```csharp
void Cut(double depth);
double ComputeVolume(bool includeHoles);
IList<IFeature> GetFeatures();
```

A real method signature tells you three things, always, in this
order: the **return type** (`void`, `double`, `IList<IFeature>` — what
you get back, or nothing at all for `void`), the **name**, and the
**parameter list** (each real parameter's own type and name, in
order). Reading `IList<IFeature> GetFeatures();` left to right: "this
gives me back a real list of `IFeature` objects, takes no arguments."

## Overloads: the same real name, different real inputs

```csharp
void Cut(double depth);
void Cut(double depth, double feedRate);
```

Two real, separate methods, both named `Cut` — C# picks the right one
based on how many real arguments you pass, and their real types. This
is genuinely different from Python, where a second `def Cut` would
just replace the first. In a real, unfamiliar API's documentation,
seeing the identical name listed twice (or more) means: check the
real, full parameter list for each one, not just the name.

## Generics: `<T>` means "you tell me the real type"

```csharp
IList<IFeature> features = part.GetFeatures();
IEnumerable<string> names = part.GetFeatureNames();
```

`IList<IFeature>` reads as "a real, ordered, list-like collection,
specifically of `IFeature` objects" — the identical real idea as
Python's own `list[Feature]` type hint, except C#'s own version is
real, checked, and enforced, not merely advisory. `IEnumerable<T>` is
the real, more general cousin — "something you can real, `foreach`
over," with no promise of real indexing or a known length the way
`IList<T>` gives you. If you see `IEnumerable<T>` in a real API and
just want to loop over it, that's almost always enough:

```csharp
foreach (var name in names)
{
    Console.WriteLine(name);
}
```

## Nullable types: a real, explicit "or nothing"

```csharp
IPart? FindPartByName(string name);
```

The real `?` after `IPart` means this method can genuinely return
`null` — "no part found" is a real, expected outcome, not an error.
Reading a real API's documentation, a `?` is a direct, honest signal:
check for `null` before using the real result.

```csharp
IPart? part = project.FindPartByName("Bracket");
if (part is not null)
{
    Console.WriteLine(part.Name);
}
```

## Definition of done

- [ ] You can read a real, unfamiliar method signature and state its
      return type, name, and parameters correctly, without help.
- [ ] You found a real, overloaded method somewhere (in .NET's own
      real standard library, `Console.WriteLine` has several) and can
      explain how C# picks which one runs.
- [ ] You can read `IList<T>` / `IEnumerable<T>` and know which real
      operations each one promises.
- [ ] You checked a real, nullable return value with `is not null`
      before using it.

## Next

[Lesson 03 — Discovering an API at Runtime](lesson-03-discovering-an-api-at-runtime.md)
gives you the real, direct C# equivalent of Python's `dir()` and
`help()` — printing out everything a real, unfamiliar object actually
has, live, while your program runs.
