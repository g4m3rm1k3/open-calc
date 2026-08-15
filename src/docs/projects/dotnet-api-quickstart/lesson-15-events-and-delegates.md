# Lesson 15: Events and Delegates

**What this covers:** how a real host API talks back to your code —
not you calling it, but it calling *you*, when something real happens
— `event`, `EventHandler`, subscribing, and the real, common leak from
forgetting to unsubscribe.

**What you need first:** [Lesson 11](lesson-11-just-enough-csharp-syntax.md).

**Same honest note as Lessons 05–06:** the real, specific events your
host application exposes — their real names, and when they actually
fire — are defined in its own real documentation. The mechanism below
is real and standard; the example names are illustrative.

---

## The real problem this solves

So far, every real interaction in this series has been you calling
*into* the host: `part.Cut(5.0)`, `project.FindPartByName(...)`. A
real host application also needs to tell *you* things: "the user
changed their selection," "a file just opened," "the document is
about to close." Python solves this with a plain callback — pass a
function, get called later. C# has a real, dedicated, built-in
mechanism for exactly this: **events**.

## Delegates: a real, type-safe description of "a method shaped like this"

```csharp
public delegate void SelectionChangedHandler(object sender, EventArgs e);
```

A `delegate` declares a real *type* whose values are methods matching
a specific, real signature — not data, a real reference to a method
itself. You'll rarely write one from scratch: .NET already ships two
real, standard ones almost every event uses —

```csharp
public event EventHandler SelectionChanged;
public event EventHandler<PartCutEventArgs> PartCut;
```

`EventHandler` is the real, plain shape (`(object sender, EventArgs
e)`) for "something happened, no extra data." `EventHandler<T>` is the
real, generic version for "something happened, and here's the real
data about it" — `T` is your own real, custom class carrying that
data.

## `event`: a real, restricted delegate

`event` is a real, deliberately limited kind of field. The class that
declares it (the host, here) can real, freely invoke it internally.
Code outside that class — you — can only do two, real things:
subscribe (`+=`) or unsubscribe (`-=`). You can never call it directly
yourself, and you can never real, silently overwrite someone else's
subscription — this is the real reason `event` exists instead of a
plain, public delegate field.

## Subscribing to a real event

```csharp
public class ToolPanel
{
    private readonly IHostApplication _host;

    public ToolPanel(IHostApplication host)
    {
        _host = host;
        _host.SelectionChanged += Host_SelectionChanged;
    }

    private void Host_SelectionChanged(object sender, EventArgs e)
    {
        logger.LogInformation("Selection changed");
    }
}
```

`_host.SelectionChanged += Host_SelectionChanged` real, registers your
method as one of (possibly several) real handlers — when the host
later real, raises the event internally, every real, subscribed method
runs. The handler's own real signature must match the event's real
delegate type exactly — `object sender, EventArgs e`, here.

## Custom event data

```csharp
public class PartCutEventArgs : EventArgs
{
    public string PartName { get; }
    public double Depth { get; }

    public PartCutEventArgs(string partName, double depth)
    {
        PartName = partName;
        Depth = depth;
    }
}
```

```csharp
_host.PartCut += (sender, e) =>
{
    logger.LogInformation("Part {PartName} cut at {Depth}", e.PartName, e.Depth);
};
```

A real, custom `EventArgs` subclass is the standard, real way an event
carries extra, real detail — real properties, read the identical way
you'd read any other object's properties (Lesson 02). The lambda form
(`(sender, e) => { ... }`) works too, for a real, short, throwaway
handler.

## Unsubscribe, or leak

```csharp
public void Dispose()
{
    _host.SelectionChanged -= Host_SelectionChanged;
}
```

As long as your handler stays subscribed, the host holds a real,
live reference to your object — it cannot be real, garbage collected,
even after your add-in should be done with it. This is a real, common,
genuine memory leak in add-in code specifically. `-=` with the
identical, real, named method removes it; this is also the real reason
a **named method** is often preferable to an inline lambda for an
event you intend to real, later unsubscribe — you can't `-=` a lambda
you never kept a reference to.

## Definition of done

- [ ] You can explain, in your own words, the real difference between
      calling a method on a host object and subscribing to one of its
      events.
- [ ] You subscribed to a real event with `+=` using a named handler
      method matching its real delegate signature.
- [ ] You read real, custom data off an `EventArgs` subclass inside a
      handler.
- [ ] You can state, in your own words, why forgetting `-=` causes a
      real leak, and when you'd need to do it.

## Next

[Lesson 16 — Extension Methods](lesson-16-extension-methods.md) answers
a question Lesson 14 raised without explaining: why does `.Where()`
work on a collection you never wrote, and why won't Lesson 03's
reflection show it the way you'd expect?
