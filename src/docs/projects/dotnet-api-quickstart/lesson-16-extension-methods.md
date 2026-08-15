# Lesson 16: Extension Methods

**What this covers:** why `.Where()` (Lesson 14) works on a collection
you never wrote, why `part.ToDisplayLabel()` (Lesson 12) works on an
enum you own, and why Lesson 03's reflection won't show either one
where you'd expect.

**What you need first:** [Lesson 14](lesson-14-linq-querying-collections.md).

---

## The real problem: adding a method to a type you can't edit

You often want a real, extra helper method on a type you didn't write
— a real host API's `IPart` interface, say — but you real, genuinely
cannot edit its source; it's someone else's compiled `.dll`. C# solves
this with a real, specific pattern: an **extension method**.

## The real syntax

```csharp
public static class PartExtensions
{
    public static bool HasHoles(this IPart part)
    {
        return part.GetFeatures().Any(f => f.Type == "Hole");
    }
}
```

Two, real requirements make this an extension method rather than an
ordinary static helper: the containing class must be `static`, and the
first real parameter is prefixed with `this` — `this IPart part`. That
`this` is the real, entire signal: "attach this method to `IPart`
itself."

## Calling it: real, indistinguishable from a true instance method

```csharp
if (part.HasHoles())
{
    logger.LogInformation("{PartName} has holes", part.Name);
}
```

At the real call site, `part.HasHoles()` looks and reads identically
to a real, true instance method — genuinely no way to tell, just from
this line, that `HasHoles` doesn't actually live on `IPart` at all.
This is the real, whole trick behind Lesson 14's LINQ methods: `Where`,
`Select`, `Any` are all real extension methods, defined in `System.Linq`
on `IEnumerable<T>` — not true members of every collection type, which
is exactly why `using System.Linq;` was required to unlock them.

## Why Lesson 03's reflection won't show them where expected

```csharp
foreach (var method in typeof(IPart).GetMethods())
{
    Console.WriteLine(method.Name); // HasHoles will NOT appear here
}
```

`GetMethods()` on `IPart` genuinely only lists `IPart`'s own, real,
true members. `HasHoles` is real and static, actually declared on
`PartExtensions`, not `IPart` — so it's real, invisible from this
angle. If a real, unfamiliar type seems to be missing a method you've
definitely seen called on it, check whether it's really an extension
method defined somewhere else, findable instead via Visual Studio's
IntelliSense (Lesson 04), which real, does show applicable extension
methods in its dropdown.

## Requiring the right, real `using`

An extension method only real, appears on a type if the `using` for
its containing *namespace* is present:

```csharp
using MyAddIn.Extensions; // required for part.HasHoles() to resolve
```

Without it, `part.HasHoles()` genuinely fails to compile — the real
method exists, but C# won't real, attach it unless its namespace is in
scope. This is the identical, real reason `System.Linq` has to be
`using`-ed before `.Where()` becomes available.

## Real revisit: Lesson 12's `ToDisplayLabel`

```csharp
public static class PartStatusExtensions
{
    public static string ToDisplayLabel(this PartStatus status) => status switch
    {
        PartStatus.Draft => "Draft (not released)",
        PartStatus.Released => "Released — Approved for Production",
        PartStatus.Obsolete => "Obsolete — Do Not Use",
        _ => status.ToString()
    };
}
```

Now the shape from Lesson 12 is real, fully explained: `this
PartStatus status` attaches `ToDisplayLabel` onto every real
`PartStatus` value, letting `status.ToDisplayLabel()` read exactly
like a real, true member — the identical, real pattern as `HasHoles`
above, just attached to an `enum` (Lesson 12) instead of an interface.

## Definition of done

- [ ] You wrote a real extension method, using `this` on its first
      parameter, and called it as if it were a true instance method.
- [ ] You can explain, in your own words, why `GetMethods()` (Lesson
      03) doesn't list an extension method on its target type.
- [ ] You can state, in your own words, why a missing `using` makes an
      otherwise-correct extension method call fail to compile.

## Next

[Lesson 17 — Debugging and the Immediate Window](lesson-17-debugging-and-the-immediate-window.md)
gives you the real, direct C# equivalent of your own stated Python
workflow — "I just print stuff and look at it" — while a real program
is actually paused and running.
