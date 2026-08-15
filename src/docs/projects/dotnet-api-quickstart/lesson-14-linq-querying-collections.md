# Lesson 14: LINQ — Querying Collections the Real, Standard Way

**What this covers:** `Where`, `Select`, `FirstOrDefault`, `Any`, and
`OrderBy` — the real, idiomatic way to filter, transform, and search
the `IList<T>`/`IEnumerable<T>` collections a real API keeps handing
you, instead of hand-written `foreach` loops.

**What you need first:** [Lesson 02](lesson-02-reading-an-unfamiliar-types-shape.md).

---

## The real, direct parallel to Python

```python
holes = [f for f in features if f.type == "Hole"]
names = [f.name for f in features]
first_hole = next((f for f in features if f.type == "Hole"), None)
has_holes = any(f.type == "Hole" for f in features)
```

```csharp
using System.Linq;

var holes = features.Where(f => f.Type == "Hole").ToList();
var names = features.Select(f => f.Name).ToList();
var firstHole = features.FirstOrDefault(f => f.Type == "Hole");
bool hasHoles = features.Any(f => f.Type == "Hole");
```

`f => f.Type == "Hole"` is a real **lambda** — the direct, real
equivalent of Python's `lambda f: f.type == "Hole"`, or the condition
inside a real comprehension. `Where` is real filtering (Python's `if`
clause); `Select` is a real transform (Python's expression before
`for`); together they cover most of what a real list comprehension
does, as a real, chainable method call instead of special syntax.
`using System.Linq;` is required to unlock these — they're not real,
built-in members of every collection; they're **extension methods**
(Lesson 16 explains exactly how that works).

## `FirstOrDefault` and `Any`: real, direct answers, no loop

```csharp
var firstHole = features.FirstOrDefault(f => f.Type == "Hole");
if (firstHole is not null)
{
    Console.WriteLine(firstHole.Name);
}
```

`FirstOrDefault` returns the real, first matching item, or `null` if
none exists — real, direct parallel to Python's `next(..., None)`
pattern, and pairs naturally with the nullable-check habit from Lesson
02. `Any` answers a real yes/no question without you writing a real
loop and a `bool` flag by hand.

## Chaining: build a real query one real step at a time

```csharp
var largeHoleNames = features
    .Where(f => f.Type == "Hole")
    .Where(f => f.Diameter > 10.0)
    .OrderByDescending(f => f.Diameter)
    .Select(f => f.Name)
    .ToList();
```

Each real method returns a real, new sequence, so they chain — read
top to bottom as real, successive filters and transforms: keep holes,
keep only the real large ones, sort them, then pull out just the real
names. This chained, real style is what you'll see constantly in any
real, modern C# codebase working with collections.

## One real, important gotcha: deferred execution

```csharp
var query = features.Where(f => f.Type == "Hole"); // nothing has actually run yet
var list = query.ToList(); // *now* it actually runs
```

Most LINQ methods (`Where`, `Select`, `OrderBy`) are real and **lazy**
— they build up a real, described query but don't actually touch your
real data until something real forces it to run: `ToList()`,
`foreach`, `FirstOrDefault()`, `Any()`, `Count()`. This matters if the
real, underlying collection can change between building the query and
using it — call `.ToList()` once you want a real, fixed snapshot.

## Definition of done

- [ ] You filtered a real collection with `Where` and can read a real
      lambda expression (`f => ...`) correctly.
- [ ] You transformed a real collection with `Select`.
- [ ] You used `FirstOrDefault` and correctly checked its result for
      `null` before using it.
- [ ] You chained at least three real LINQ methods together in one
      real statement.
- [ ] You can explain, in your own words, what "deferred execution"
      means and why `.ToList()` matters.

## Next

[Lesson 15 — Events and Delegates](lesson-15-events-and-delegates.md)
covers the real, other direction a host API talks to your code: not
you calling it, but it calling *you*, when something real happens.
