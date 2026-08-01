---
series: csharp-fundamentals
level: 17
title: LINQ Deep Dive
lang: csharp
---

# LINQ Deep Dive

`Where`, `Select`, `OrderBy` — the previous lesson's four operators — cover filtering, transforming, and sorting. Real data questions often need more: grouping items by a shared property, combining two related collections, or asking a single yes/no question about an entire sequence without ever materializing a result list. This lesson covers the LINQ operators that answer those.

## GroupBy — Partitioning by a Shared Key

```csharp
using System;
using System.Linq;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var items = new List<(string Category, string Name)>
        {
            ("Tools", "Hammer"), ("Tools", "Wrench"), ("Electronics", "Cable")
        };

        var groups = items.GroupBy(i => i.Category);
        foreach (var g in groups)
        {
            Console.WriteLine(g.Key + ": " + g.Count());
        }
    }
}
```

```text
Tools: 2
Electronics: 1
```

`items.GroupBy(i => i.Category)` — partitions `items` into groups sharing the same `Category`, without ever writing the manual `Dictionary<string, List<...>>` bookkeeping this project's own LINQ lesson built by hand.

`g.Key` — each group's shared value — `"Tools"`, then `"Electronics"`. `g.Count()` — how many items landed in that particular group. `g` itself is a real, iterable sequence of just that group's items — `foreach (var item in g)` would work too, visiting only that group's members.

## Join — Combining Two Related Collections

```csharp
using System;
using System.Linq;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var customers = new List<(int Id, string Name)> { (1, "Alice"), (2, "Bob") };
        var orders = new List<(int CustomerId, string Item)> { (1, "Book"), (1, "Pen"), (2, "Laptop") };

        var joined = customers.Join(
            orders,
            c => c.Id,
            o => o.CustomerId,
            (c, o) => c.Name + " ordered " + o.Item
        );

        foreach (var line in joined) Console.WriteLine(line);
    }
}
```

```text
Alice ordered Book
Alice ordered Pen
Bob ordered Laptop
```

`customers.Join(orders, c => c.Id, o => o.CustomerId, (c, o) => ...)` — four arguments: the second sequence to join against (`orders`), a lambda picking the matching key from each `customer`, a lambda picking the matching key from each `order`, and a lambda describing what to produce for every matched pair. Every `order` whose `CustomerId` equals some `customer.Id` produces one real result — Alice matches two orders, so she appears twice.

**CS lens:** This is the exact same relational idea as SQL's `INNER JOIN` — matching rows from two separate collections by a shared key — expressed as a real, in-memory C# operation instead of a database query.

## Any, All, First — Asking Questions Without Materializing a List

```csharp
using System;
using System.Linq;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var nums = new List<int> { 1, 2, 3, 4, 5 };

        Console.WriteLine(nums.Any(n => n > 3));
        Console.WriteLine(nums.All(n => n > 0));
        Console.WriteLine(nums.First(n => n > 2));
        Console.WriteLine(nums.FirstOrDefault(n => n > 100));
        Console.WriteLine(nums.Count(n => n % 2 == 0));
    }
}
```

```text
True
True
3
0
2
```

`nums.Any(n => n > 3)` — `true` if *at least one* element satisfies the condition. Stops checking the moment it finds the first match — doesn't scan the rest.
`nums.All(n => n > 0)` — `true` only if *every* element satisfies the condition. Stops the moment it finds the first element that fails.
`nums.First(n => n > 2)` — returns the first matching element itself, `3`, not a `bool`. Throws a real exception if nothing matches at all.
`nums.FirstOrDefault(n => n > 100)` — the safer version: returns `default(int)` (`0`) instead of throwing, when nothing matches.
`nums.Count(n => n % 2 == 0)` — counts how many elements match, without building a filtered list first.

**SE lens:** `Any`/`All`/`First` all use the same short-circuiting instinct as `&&`/`||` (Level 1) — checking `nums.Any(n => n > 3)` never has to look past `4`, the first element that actually satisfies the condition, no matter how many more elements come after it in a much longer real list.

## Take and Skip — Paging Through a Sequence

```csharp
using System;
using System.Linq;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var nums = new List<int> { 5, 3, 8, 1, 9, 2 };

        var top3 = nums.OrderByDescending(n => n).Take(3).ToList();
        Console.WriteLine(string.Join(",", top3));

        var skip2 = nums.OrderBy(n => n).Skip(2).ToList();
        Console.WriteLine(string.Join(",", skip2));
    }
}
```

```text
9,8,5
3,5,8,9
```

`.Take(3)` — keeps only the first `3` elements of whatever sequence comes before it — here, the top `3` after sorting descending.
`.Skip(2)` — discards the first `2` elements, keeping everything after — here, everything except the two smallest, after sorting ascending.

## Challenge: group_and_count

Given a `List<string>` of words, write a `static Dictionary<int, int> GroupAndCount(List<string> words)` method that returns a dictionary mapping each distinct word *length* to how many words in the list have that length. Use `GroupBy` on `word.Length`, then build the dictionary from the groups.

```challenge
static Dictionary<int, int> GroupAndCount(List<string> words)
{
    // TODO
}
```

```test
var result = GroupAndCount(new List<string> { "cat", "dog", "bird", "ox", "of" });
assert result[3] == 2
assert result[4] == 1
assert result[2] == 2
assert GroupAndCount(new List<string>()).Count == 0
```
